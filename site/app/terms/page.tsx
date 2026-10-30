import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { SHOP } from "@/content/settings";

export const metadata: Metadata = { title: "Terms of Sale" };

// DRAFT: have this checked before launch. Add the registered company name and number if the business is a limited company.
export default function Terms() {
  return (
    <LegalPage title="Terms of sale" updated="30 October 2026">
      <p>These terms cover orders placed on this website with Isaac&apos;s Coffee, {SHOP.address.line1}, {SHOP.address.town} {SHOP.address.postcode}.</p>
      <h3>Prices and payment</h3>
      <p>Prices are in pounds and include VAT where it applies. Payment is taken by Stripe when you order. A contract forms when we email your order confirmation.</p>
      <h3>Subscriptions</h3>
      <p>A subscription charges your card on the same day every 2 or 4 weeks, at the price shown when you subscribed, until you cancel. We&apos;ll email you at least 14 days before any price change. Cancel any time from <Link href="/account">your account</Link>.</p>
      <h3>Gift cards</h3>
      <p>Gift cards can be spent on this website. They have no cash value and don&apos;t expire. Any balance left after an order stays on the card.</p>
      <h3>Delivery</h3>
      <p>See our <Link href="/shipping">shipping policy</Link> for rates and times.</p>
      <h3>Returns</h3>
      <p>See our <Link href="/refunds">refund policy</Link>.</p>
      <h3>Contact</h3>
      <p>{SHOP.email}</p>
    </LegalPage>
  );
}
