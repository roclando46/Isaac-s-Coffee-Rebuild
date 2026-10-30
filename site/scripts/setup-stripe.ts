// One-time Stripe setup. Run once in test mode, then again with live keys at launch:
//   STRIPE_SECRET_KEY=sk_test_... npm run setup:stripe
// Creates the WELCOME10 code (10% off, first order only) and the customer portal settings. Safe to run twice.
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("Set STRIPE_SECRET_KEY first");
const stripe = new Stripe(key);
const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://isaacscoffee.co.uk";

const existing = await stripe.promotionCodes.list({ code: "WELCOME10", limit: 1 });
if (existing.data.length) {
  console.log("WELCOME10 already exists");
} else {
  const coupon = await stripe.coupons.create({ percent_off: 10, duration: "once", name: "Welcome 10%" });
  await stripe.promotionCodes.create({
    promotion: { type: "coupon", coupon: coupon.id },
    code: "WELCOME10",
    restrictions: { first_time_transaction: true },
  });
  console.log("Created WELCOME10");
}

await stripe.billingPortal.configurations.create({
  business_profile: { headline: "Isaac's Coffee: manage your subscription", privacy_policy_url: `${site}/privacy`, terms_of_service_url: `${site}/terms` },
  features: {
    customer_update: { enabled: true, allowed_updates: ["email", "address", "phone", "shipping"] },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: { enabled: true, mode: "at_period_end", cancellation_reason: { enabled: true, options: ["too_expensive", "unused", "switched_service", "other"] } },
  },
  default_return_url: `${site}/account`,
});
console.log("Customer portal configured");
