import { NextResponse } from "next/server";
import { withErrors } from "@/lib/api";
import type Stripe from "stripe";
import { eq } from "drizzle-orm";
import { SHIPPING } from "@/content/settings";
import { CartError, CheckoutRequest, itemDetail, itemTitle, quote, unitPrice } from "@/lib/cart";
import { checkouts, db } from "@/lib/db";
import { resolveCode } from "@/lib/orders/codes";
import { siteUrl, stripe } from "@/lib/stripe";

const todayUK = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });

export const POST = withErrors(async (req: Request) => {
  const parsed = CheckoutRequest.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Something in your cart isn't valid. Remove it and add it again." }, { status: 400 });
  const body = parsed.data;

  let q;
  try {
    q = quote(body.items, body.delivery);
  } catch (e) {
    return NextResponse.json({ error: e instanceof CartError ? e.message : "Your cart has an item we no longer sell." }, { status: 400 });
  }
  for (const item of body.items) {
    if (item.type === "giftcard" && item.sendOn < todayUK()) {
      return NextResponse.json({ error: "A gift card's send date is in the past. Pick today or later." }, { status: 400 });
    }
  }

  const code = await resolveCode(body.code, q.total, { createCoupon: true });
  if (code.kind === "invalid") return NextResponse.json({ error: code.message }, { status: 400 });

  const [checkout] = await db().insert(checkouts).values({
    kind: "shop",
    payload: body,
    giftCardId: code.kind === "gift" ? code.giftCardId : null,
    giftCardApplied: code.kind === "gift" ? code.applied : 0,
  }).returning({ id: checkouts.id });

  const recurring = q.weeks ? { interval: "week" as const, interval_count: q.weeks } : undefined;
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = body.items.map((item) => ({
    quantity: item.qty,
    price_data: {
      currency: "gbp",
      unit_amount: unitPrice(item),
      product_data: { name: itemTitle(item), description: itemDetail(item) },
      ...(item.type === "bag" && item.purchase === "sub" ? { recurring } : {}),
    },
  }));
  const rate = SHIPPING[body.delivery];
  if (q.firstDelivery > 0) {
    lineItems.push({ quantity: 1, price_data: { currency: "gbp", unit_amount: q.firstDelivery, product_data: { name: `Delivery: ${rate.label}` } } });
  }
  if (q.recurringDelivery > 0) {
    lineItems.push({ quantity: 1, price_data: { currency: "gbp", unit_amount: q.recurringDelivery, recurring, product_data: { name: `Delivery each box: ${rate.label}` } } });
  }

  const shipsToBuyer = q.needsDelivery && body.delivery !== "collect";
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: q.weeks ? "subscription" : "payment",
    line_items: lineItems,
    metadata: { checkoutId: checkout.id, delivery: body.delivery },
    success_url: `${siteUrl()}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/shop?cart=open`,
    phone_number_collection: { enabled: true },
    ...(shipsToBuyer ? { shipping_address_collection: { allowed_countries: ["GB"] } } : {}),
    ...(q.weeks
      ? { subscription_data: { metadata: { checkoutId: checkout.id, delivery: body.delivery } } }
      : { customer_creation: "always" as const }),
    custom_text: {
      submit: { message: "After delivery we may email a reorder reminder and ask for a review. Every email has a link to turn these off." },
    },
  };
  if (code.kind === "gift" && code.couponId) params.discounts = [{ coupon: code.couponId }];
  if (code.kind === "promo") params.discounts = [{ promotion_code: code.promotionCodeId }];

  const session = await stripe().checkout.sessions.create(params);
  await db().update(checkouts).set({ stripeSessionId: session.id }).where(eq(checkouts.id, checkout.id));
  return NextResponse.json({ url: session.url });
}, "Checkout is unavailable right now. Try again in a few minutes, or call the café.");
