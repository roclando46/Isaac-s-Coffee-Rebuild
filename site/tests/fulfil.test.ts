// Runs the webhook handlers against an in-memory Postgres (PGlite) with the real migration.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { beforeAll, describe, expect, it, vi } from "vitest";
import * as schema from "@/lib/db/schema";
import { setDbForTests } from "@/lib/db";
import type { CheckoutRequest } from "@/lib/cart";

const sent: { to: string; subject: string }[] = [];
vi.mock("@/lib/email/send", () => ({ sendMail: async (m: { to: string; subject: string }) => { sent.push(m); } }));

let db: ReturnType<typeof drizzle<typeof schema>>;
let fulfil: typeof import("@/lib/orders/fulfil");

beforeAll(async () => {
  process.env.APP_SECRET = "y".repeat(40);
  const pg = new PGlite();
  const dir = path.resolve(import.meta.dirname, "../drizzle");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    for (const stmt of readFileSync(path.join(dir, f), "utf8").split("--> statement-breakpoint")) if (stmt.trim()) await pg.exec(stmt);
  }
  db = drizzle(pg, { schema });
  setDbForTests(db);
  fulfil = await import("@/lib/orders/fulfil");
});

async function checkout(payload: CheckoutRequest, extra: Partial<typeof schema.checkouts.$inferInsert> = {}) {
  const [row] = await db.insert(schema.checkouts).values({ kind: "shop", payload, ...extra }).returning();
  return row.id;
}

const session = (id: string, checkoutId: string, over: Record<string, unknown> = {}) => ({
  id, payment_status: "paid", metadata: { checkoutId }, customer: "cus_1", subscription: null,
  amount_total: 5000, total_details: { amount_discount: 0 },
  customer_details: { email: "buyer@example.com", name: "Alex Buyer" },
  collected_information: { shipping_details: { name: "Alex Buyer", address: { line1: "2 Crown Rd", line2: null, city: "Twickenham", postal_code: "TW1 3EE" } } },
  ...over,
}) as unknown as Stripe.Checkout.Session;

describe("webhook fulfilment", () => {
  it("turns a paid cart into an order, a parcel, gift cards and gift boxes", async () => {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
    const id = await checkout({
      delivery: "tracked48", code: "",
      items: [
        { type: "bag", slug: "house-blend", size: "500g", grind: "Filter", purchase: "once", qty: 2, giftMessage: "Happy birthday" },
        { type: "giftcard", amount: 2500, recipientEmail: "friend@example.com", recipientName: "Sam", sendOn: today, message: "Enjoy", qty: 1 },
        { type: "giftcard", amount: 5000, recipientEmail: "later@example.com", recipientName: "", sendOn: "2099-12-24", message: "", qty: 1 },
        { type: "giftsub", months: 3, slug: "blue-mountain-harmony", grind: "Whole Bean", recipientName: "Jo", address: { line1: "9 Park Rd", line2: "", city: "Richmond", postcode: "tw9 1aa" }, message: "", qty: 1 },
      ],
    });
    sent.length = 0;
    await fulfil.handleCheckoutCompleted(session("cs_1", id));

    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.stripeSessionId, "cs_1"));
    expect(order.email).toBe("buyer@example.com");
    expect(order.hasOneOffCoffee).toBe(true);
    expect(order.number).toBeGreaterThanOrEqual(2001);

    const parcels = await db.select().from(schema.shipments).where(eq(schema.shipments.orderId, order.id));
    const own = parcels.filter((p) => p.source === "order");
    const gifts = parcels.filter((p) => p.source === "giftsub").sort((a, b) => a.dueOn.localeCompare(b.dueOn));
    expect(own).toHaveLength(1);
    expect(own[0].giftMessage).toBe("Happy birthday");
    expect(gifts).toHaveLength(3);
    expect((gifts[0].address as { postcode: string }).postcode).toBe("TW9 1AA");
    expect(gifts[0].giftMessage).toContain("Alex Buyer");
    expect(gifts[1].giftMessage).toBeNull();

    const cards = await db.select().from(schema.giftCards);
    expect(cards).toHaveLength(2);
    expect(cards.find((c) => c.recipientEmail === "friend@example.com")?.sentAt).not.toBeNull();
    expect(cards.find((c) => c.recipientEmail === "later@example.com")?.sentAt).toBeNull();

    expect(sent.map((m) => m.to).sort()).toEqual(["buyer@example.com", "friend@example.com"]);
  });

  it("ignores a repeat delivery of the same event", async () => {
    const before = { parcels: (await db.select().from(schema.shipments)).length, cards: (await db.select().from(schema.giftCards)).length };
    const checkoutRow = (await db.select().from(schema.checkouts)).find((r) => (r.payload as CheckoutRequest).items.length === 4)!;
    await fulfil.handleCheckoutCompleted(session("cs_1", checkoutRow.id));
    expect((await db.select().from(schema.shipments)).length).toBe(before.parcels);
    expect((await db.select().from(schema.giftCards)).length).toBe(before.cards);
  });

  it("takes the used amount off a gift card and keeps the rest", async () => {
    const [card] = await db.insert(schema.giftCards).values({
      code: "ISAAC-TEST-0001", initialAmount: 5000, balance: 5000, purchaserEmail: "a@b.co", recipientEmail: "c@d.co", sendOn: "2026-01-01",
    }).returning();
    const id = await checkout({ delivery: "collect", code: "ISAAC-TEST-0001", items: [{ type: "bag", slug: "house-blend", size: "250g", grind: "Espresso", purchase: "once", qty: 1, giftMessage: "" }] },
      { giftCardId: card.id, giftCardApplied: 1250 });
    await fulfil.handleCheckoutCompleted(session("cs_2", id, { amount_total: 0, total_details: { amount_discount: 1250 }, collected_information: null }));
    const [after] = await db.select().from(schema.giftCards).where(eq(schema.giftCards.id, card.id));
    expect(after.balance).toBe(3750);
    const [parcel] = await db.select().from(schema.shipments).where(eq(schema.shipments.delivery, "collect"));
    expect(parcel.address).toBeNull();
  });

  it("queues a box for each subscription renewal, once per invoice", async () => {
    const id = await checkout({ delivery: "tracked48", code: "", items: [
      { type: "bag", slug: "south-american-fusion", size: "1kg", grind: "Espresso", purchase: "sub", weeks: 2, qty: 1, giftMessage: "" },
      { type: "bag", slug: "house-blend", size: "250g", grind: "Filter", purchase: "once", qty: 1, giftMessage: "" },
    ] });
    await fulfil.handleCheckoutCompleted(session("cs_3", id, { subscription: "sub_9" }));
    const invoice = { id: "in_1", billing_reason: "subscription_cycle", parent: { subscription_details: { subscription: "sub_9" } } } as unknown as Stripe.Invoice;
    await fulfil.handleInvoicePaid(invoice);
    await fulfil.handleInvoicePaid(invoice);
    const renewals = await db.select().from(schema.shipments).where(eq(schema.shipments.source, "renewal"));
    expect(renewals).toHaveLength(1);
    expect((renewals[0].items as { slug: string }[]).map((i) => i.slug)).toEqual(["south-american-fusion"]);
  });

  it("records drinks orders and tells the café", async () => {
    const [row] = await db.insert(schema.checkouts).values({ kind: "drinks", payload: { name: "Priya", pickup: "10:30", lines: [{ id: "latte", size: "Large", milk: "Oat", qty: 2 }] } }).returning();
    sent.length = 0;
    await fulfil.handleCheckoutCompleted(session("cs_4", row.id, { amount_total: 900 }));
    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.stripeSessionId, "cs_4"));
    expect(order.kind).toBe("drinks");
    expect(order.pickupAt).toBe("10:30");
    expect(sent).toHaveLength(2);
    expect(sent[0].subject).toContain("Priya");
  });
});
