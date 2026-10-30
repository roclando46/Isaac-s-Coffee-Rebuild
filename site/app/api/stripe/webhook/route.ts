import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { handleCheckoutCompleted, handleInvoicePaid } from "@/lib/orders/fulfil";
import { stripe } from "@/lib/stripe";

// In Stripe: Developers, Webhooks, Add endpoint https://isaacscoffee.co.uk/api/stripe/webhook
// Events: checkout.session.completed, checkout.session.async_payment_succeeded, invoice.paid
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await handleCheckoutCompleted(event.data.object);
      break;
    case "invoice.paid":
      await handleInvoicePaid(event.data.object);
      break;
  }
  return NextResponse.json({ received: true });
}
