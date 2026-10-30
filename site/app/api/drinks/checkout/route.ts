import { NextResponse } from "next/server";
import { withErrors } from "@/lib/api";
import { eq } from "drizzle-orm";
import { getDrink } from "@/content/drinks";
import { DrinksRequest, drinkPrice, pickupSlots } from "@/lib/drinks";
import { checkouts, db } from "@/lib/db";
import { siteUrl, stripe } from "@/lib/stripe";

export const POST = withErrors(async (req: Request) => {
  const parsed = DrinksRequest.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Add a drink, a name and a collection time." }, { status: 400 });
  const body = parsed.data;
  if (!pickupSlots(new Date()).includes(body.pickup)) {
    return NextResponse.json({ error: "That collection time has passed. Pick another time." }, { status: 400 });
  }
  let lineItems;
  try {
    lineItems = body.lines.map((l) => ({
      quantity: l.qty,
      price_data: { currency: "gbp", unit_amount: drinkPrice(l.id, l.size, l.milk), product_data: { name: getDrink(l.id)!.name, description: `${l.size}, ${l.milk} milk` } },
    }));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
  const [checkout] = await db().insert(checkouts).values({ kind: "drinks", payload: body }).returning({ id: checkouts.id });
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    metadata: { checkoutId: checkout.id },
    success_url: `${siteUrl()}/thanks?session_id={CHECKOUT_SESSION_ID}&drinks=1`,
    cancel_url: `${siteUrl()}/order-ahead`,
    custom_text: { submit: { message: `Collect at ${body.pickup} today from Lower Ground, 120 St Margarets Road.` } },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  });
  await db().update(checkouts).set({ stripeSessionId: session.id }).where(eq(checkouts.id, checkout.id));
  return NextResponse.json({ url: session.url });
}, "Ordering is unavailable right now. Order at the counter, or try again in a few minutes.");
