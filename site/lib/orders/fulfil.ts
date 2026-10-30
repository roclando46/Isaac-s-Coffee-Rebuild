// Turns paid Stripe events into orders, parcels to pack, gift cards and emails.
// Every handler is safe to run twice: Stripe retries webhooks.
import type Stripe from "stripe";
import { and, eq, sql } from "drizzle-orm";
import { getDrink } from "@/content/drinks";
import { getProduct } from "@/content/products";
import { GIFT_SUBSCRIPTION, SHIPPING, SHOP } from "@/content/settings";
import { CheckoutRequest, itemDetail, itemTitle, lineTotal, type Address, type CartItem } from "@/lib/cart";
import { DrinksRequest, drinkPrice } from "@/lib/drinks";
import { checkouts, db, giftCards, orders, shipments } from "@/lib/db";
import { sendMail } from "@/lib/email/send";
import * as mail from "@/lib/email/templates";
import { newGiftCode } from "@/lib/giftcards";

export type ParcelItem = { slug: string; name: string; size: string; grind: string; qty: number; giftMessage?: string };
export type StoredAddress = { name: string; line1: string; line2?: string; city: string; postcode: string };

export const todayUK = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

function sessionAddress(session: Stripe.Checkout.Session): StoredAddress | null {
  const s = session.collected_information?.shipping_details;
  if (!s?.address) return null;
  return { name: s.name, line1: s.address.line1 ?? "", line2: s.address.line2 ?? "", city: s.address.city ?? "", postcode: s.address.postal_code ?? "" };
}

const parcelItem = (i: Extract<CartItem, { type: "bag" }>): ParcelItem => ({
  slug: i.slug, name: getProduct(i.slug)?.name ?? i.slug, size: i.size, grind: i.grind, qty: i.qty, giftMessage: i.giftMessage || undefined,
});

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status === "unpaid") return; // async payment methods settle later
  const checkoutId = session.metadata?.checkoutId;
  if (!checkoutId) return;
  const [checkout] = await db().select().from(checkouts).where(eq(checkouts.id, checkoutId)).limit(1);
  if (!checkout) throw new Error(`Checkout ${checkoutId} not found`);
  const [existing] = await db().select({ id: orders.id }).from(orders).where(eq(orders.stripeSessionId, session.id)).limit(1);
  if (existing) return;

  const email = session.customer_details?.email ?? "";
  const name = session.customer_details?.name ?? null;
  const customer = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const total = session.amount_total ?? 0;
  const discount = session.total_details?.amount_discount ?? 0;

  if (checkout.kind === "drinks") return fulfilDrinks(session, checkout.payload, { email, customer, total });

  const cart = CheckoutRequest.parse(checkout.payload);
  const bags = cart.items.filter((i): i is Extract<CartItem, { type: "bag" }> => i.type === "bag");
  const subscription = typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null;

  const [order] = await db().insert(orders).values({
    kind: "shop", stripeSessionId: session.id, stripeCustomerId: customer, stripeSubscriptionId: subscription,
    email, name, items: cart.items, delivery: cart.delivery, address: sessionAddress(session),
    amountTotal: total, amountDiscount: discount, hasOneOffCoffee: bags.some((b) => b.purchase === "once"),
  }).onConflictDoNothing({ target: orders.stripeSessionId }).returning();
  if (!order) return; // another delivery of this event got here first

  const today = todayUK();
  if (bags.length) {
    await db().insert(shipments).values({
      orderId: order.id, source: "order", email, name, address: sessionAddress(session), delivery: cart.delivery,
      items: bags.map(parcelItem), giftMessage: bags.map((b) => b.giftMessage).filter(Boolean).join("\n\n") || null, dueOn: today,
    });
  }

  for (const item of cart.items) {
    if (item.type === "giftsub") {
      const plan = GIFT_SUBSCRIPTION[item.months];
      const a: Address = item.address;
      await db().insert(shipments).values(Array.from({ length: plan.shipments }, (_, n) => ({
        orderId: order.id, source: "giftsub" as const, email, name: item.recipientName,
        address: { name: item.recipientName, line1: a.line1, line2: a.line2, city: a.city, postcode: a.postcode.toUpperCase() },
        delivery: "tracked48",
        items: [{ slug: item.slug, name: getProduct(item.slug)?.name ?? item.slug, size: "250g", grind: item.grind, qty: 1 }],
        giftMessage: n === 0 ? item.message || `A gift from ${name ?? "a friend"}` : null,
        dueOn: addDays(today, n * 28),
      })));
    }
    if (item.type === "giftcard") {
      const code = newGiftCode();
      const sendNow = item.sendOn <= today;
      await db().insert(giftCards).values({
        code, initialAmount: item.amount, balance: item.amount, purchaserEmail: email, recipientEmail: item.recipientEmail,
        recipientName: item.recipientName || null, message: item.message || null, sendOn: item.sendOn, orderId: order.id,
        sentAt: sendNow ? new Date() : null,
      });
      if (sendNow) {
        await sendMail({ to: item.recipientEmail, ...mail.giftCardDelivery({ ...item, code, from: name ?? email }) });
      }
    }
  }

  if (checkout.giftCardId && discount > 0) {
    const used = Math.min(discount, checkout.giftCardApplied);
    await db().update(giftCards).set({ balance: sql`greatest(${giftCards.balance} - ${used}, 0)` }).where(eq(giftCards.id, checkout.giftCardId));
  }
  await db().update(checkouts).set({ completedAt: new Date() }).where(eq(checkouts.id, checkout.id));

  if (email) {
    await sendMail({ to: email, replyTo: SHOP.email, ...mail.orderConfirmation({
      email, number: order.number ?? 0, total, discount,
      lines: cart.items.map((i) => ({ title: itemTitle(i), detail: itemDetail(i), amount: lineTotal(i) })),
      delivery: SHIPPING[cart.delivery].label, collect: cart.delivery === "collect",
    }) });
  }
}

async function fulfilDrinks(session: Stripe.Checkout.Session, payload: unknown, o: { email: string; customer: string | null; total: number }) {
  const req = DrinksRequest.parse(payload);
  const [order] = await db().insert(orders).values({
    kind: "drinks", stripeSessionId: session.id, stripeCustomerId: o.customer, email: o.email, name: req.name,
    items: req.lines, amountTotal: o.total, pickupAt: req.pickup,
  }).onConflictDoNothing({ target: orders.stripeSessionId }).returning();
  if (!order) return;
  const lines = req.lines.map((l) => `${l.qty} × ${getDrink(l.id)?.name ?? l.id}, ${l.size}, ${l.milk} milk (${(drinkPrice(l.id, l.size, l.milk) * l.qty / 100).toFixed(2)})`);
  const n = order.number ?? 0;
  await sendMail({ to: process.env.CAFE_INBOX ?? SHOP.email, ...mail.drinksOrderForCafe({ number: n, name: req.name, pickup: req.pickup, lines, total: o.total }) });
  if (o.email) await sendMail({ to: o.email, ...mail.drinksOrderForCustomer({ email: o.email, number: n, pickup: req.pickup, lines, total: o.total }) });
}

/** A subscription renewal: queue the next box. The first invoice is handled by checkout.session.completed. */
export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (invoice.billing_reason !== "subscription_cycle") return;
  const sub = invoice.parent?.subscription_details?.subscription;
  const subscriptionId = typeof sub === "string" ? sub : sub?.id;
  if (!subscriptionId) return;
  const [order] = await db().select().from(orders).where(and(eq(orders.stripeSubscriptionId, subscriptionId), eq(orders.kind, "shop"))).limit(1);
  if (!order) throw new Error(`No order for subscription ${subscriptionId}`);
  const cart = CheckoutRequest.parse({ items: order.items, delivery: order.delivery ?? "tracked48" });
  const subBags = cart.items.filter((i): i is Extract<CartItem, { type: "bag" }> => i.type === "bag" && i.purchase === "sub");
  await db().insert(shipments).values({
    orderId: order.id, source: "renewal", stripeInvoiceId: invoice.id, email: order.email, name: order.name, address: order.address,
    delivery: cart.delivery, items: subBags.map(parcelItem), dueOn: todayUK(),
  }).onConflictDoNothing({ target: shipments.stripeInvoiceId });
}
