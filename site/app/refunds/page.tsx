import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { SHOP } from "@/content/settings";

export const metadata: Metadata = { title: "Refund Policy" };

// DRAFT: have this checked before launch.
export default function Refunds() {
  return (
    <LegalPage title="Refunds and returns" updated="30 October 2026">
      <h3>Changed your mind</h3>
      <p>You can cancel an online order within 14 days of receiving it. Unopened bags can be returned for a full refund of the coffee price. For hygiene reasons we can&apos;t take back bags once the seal is opened. Email {SHOP.email} first, then post the bag back within 14 days. You pay return postage unless the order was wrong.</p>
      <h3>Something wrong with your order</h3>
      <p>If coffee arrives damaged, stale or isn&apos;t what you ordered, email us within 30 days with a photo. We&apos;ll replace it or refund you in full, including delivery. This doesn&apos;t affect your rights under the Consumer Rights Act 2015.</p>
      <h3>Subscriptions</h3>
      <p>Cancel any time from <a href="/account">your account</a>. No further boxes are charged after you cancel. A box already charged and packed still ships.</p>
      <h3>Gift cards and gift subscriptions</h3>
      <p>Unused gift cards can be refunded to the buyer within 14 days of purchase. Gift subscriptions can be cancelled within 14 days for a refund of boxes not yet sent.</p>
      <h3>Drinks orders</h3>
      <p>If we can&apos;t make your drink, we refund it in full. Let us know at the counter if anything isn&apos;t right.</p>
      <h3>How refunds are paid</h3>
      <p>To your original card, within 14 days of us agreeing the refund.</p>
    </LegalPage>
  );
}
