// Runs once a day (vercel.json): sends scheduled gift cards, reorder reminders and review requests.
import { NextResponse } from "next/server";
import { and, eq, gte, inArray, isNull, lte, notInArray, sql } from "drizzle-orm";
import { getProduct } from "@/content/products";
import { REORDER_REMINDER_DAYS, REVIEW_REQUEST_DAYS } from "@/content/settings";
import { db, giftCards, optOuts, orders, shipments } from "@/lib/db";
import { sendMail } from "@/lib/email/send";
import * as mail from "@/lib/email/templates";
import { todayUK, type ParcelItem } from "@/lib/orders/fulfil";

export const dynamic = "force-dynamic";
const daysAgo = (n: number) => new Date(Date.now() - n * 86400_000);

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}` || !process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const sent = { giftCards: 0, reminders: 0, reviews: 0 };
  const optedOut = db().select({ email: optOuts.email }).from(optOuts);

  const dueCards = await db().select().from(giftCards).where(and(isNull(giftCards.sentAt), lte(giftCards.sendOn, todayUK())));
  for (const g of dueCards) {
    await sendMail({ to: g.recipientEmail, ...mail.giftCardDelivery({ ...g, amount: g.initialAmount, from: g.purchaserEmail }) });
    await db().update(giftCards).set({ sentAt: new Date() }).where(eq(giftCards.id, g.id));
    sent.giftCards++;
  }

  // One-off coffee orders 12 to 30 days old, no reminder yet, and no newer order from the same customer.
  const due = await db().select().from(orders).where(and(
    eq(orders.kind, "shop"), eq(orders.hasOneOffCoffee, true), isNull(orders.stripeSubscriptionId), isNull(orders.reorderReminderSentAt),
    lte(orders.createdAt, daysAgo(REORDER_REMINDER_DAYS)), gte(orders.createdAt, daysAgo(30)), notInArray(orders.email, optedOut),
    sql`not exists (select 1 from orders newer where newer.email = ${orders.email} and newer.kind = 'shop' and newer.created_at > ${orders.createdAt})`,
  ));
  for (const o of due) {
    await sendMail({ to: o.email, ...mail.reorderReminder(o.email) });
    await db().update(orders).set({ reorderReminderSentAt: new Date() }).where(eq(orders.id, o.id));
    sent.reminders++;
  }

  // Parcels posted 7 to 30 days ago. Collections count from the day they were handed over.
  const delivered = await db().select().from(shipments).where(and(
    eq(shipments.status, "dispatched"), isNull(shipments.reviewRequestSentAt),
    lte(shipments.dispatchedAt, daysAgo(REVIEW_REQUEST_DAYS)), gte(shipments.dispatchedAt, daysAgo(30)),
    notInArray(shipments.email, optedOut), inArray(shipments.source, ["order", "renewal"]),
  ));
  for (const s of delivered) {
    const products = [...new Set((s.items as ParcelItem[]).map((i) => i.slug))]
      .map((slug) => ({ slug, name: getProduct(slug)?.name ?? slug }));
    await sendMail({ to: s.email, ...mail.reviewRequest(s.email, products, s.id) });
    await db().update(shipments).set({ reviewRequestSentAt: new Date() }).where(eq(shipments.id, s.id));
    sent.reviews++;
  }
  return NextResponse.json(sent);
}
