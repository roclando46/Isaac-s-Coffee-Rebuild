import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { SHOP } from "@/content/settings";

export const metadata: Metadata = { title: "Privacy Policy" };

// DRAFT: have this checked before launch.
export default function Privacy() {
  return (
    <LegalPage title="Privacy policy" updated="30 October 2026">
      <p>Isaac&apos;s Coffee, {SHOP.address.line1}, {SHOP.address.town} {SHOP.address.postcode}, decides how your personal data is used. Contact us at {SHOP.email}.</p>
      <h3>What we collect and why</h3>
      <p>Orders: your name, email, phone, delivery address and what you bought, to take payment, post your order and handle returns. Legal basis: performing our contract with you.</p>
      <p>Card details go straight to Stripe. We never see or store them.</p>
      <p>Emails: if you join our list, your email, to send offers and your welcome code. Legal basis: your consent, which you can withdraw with the unsubscribe link in every email. After an order we may send a reorder reminder and a review request about the coffee you bought. Every one has a link to stop them.</p>
      <p>Messages: what you send through the contact form, to reply to you.</p>
      <h3>Who processes it for us</h3>
      <p>Stripe (payments and subscriptions), Vercel (website hosting), Neon (database), Resend (email) and Royal Mail (delivery). Each acts on our instructions under a data processing agreement.</p>
      <h3>How long we keep it</h3>
      <p>Order records for 6 years for tax. Email list entries until you unsubscribe. Contact messages for 12 months.</p>
      <h3>Your rights</h3>
      <p>You can ask for a copy of your data, ask us to correct or delete it, object to its use, or ask us to stop marketing. Email {SHOP.email}. If you&apos;re unhappy with our answer you can complain to the Information Commissioner&apos;s Office at ico.org.uk.</p>
      <h3>Cookies</h3>
      <p>Your browser stores your cart so it's still there when you come back. We don&apos;t use advertising or tracking cookies. Café staff use one sign-in cookie for the admin area.</p>
    </LegalPage>
  );
}
