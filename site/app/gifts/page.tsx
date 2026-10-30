import type { Metadata } from "next";
import Link from "next/link";
import ChristmasDates from "@/components/ChristmasDates";
import GiftForms from "@/components/GiftForms";

export const metadata: Metadata = { title: "Coffee Gifts and Gift Cards", description: "Gift subscriptions and gift cards from Isaac's Coffee, St Margarets. Fresh speciality coffee delivered, or a gift card by email on the day you choose." };

export default function Gifts() {
  return (
    <>
      <div className="wrap page-head"><p className="eyebrow">Christmas gifts</p><h1>Give fresh coffee from St Margarets</h1>
        <p>A gift subscription posts fresh beans every 4 weeks, delivery included. A gift card arrives by email on the day you choose.</p></div>
      <section className="block wrap" style={{ display: "grid", gap: "2.5rem" }}>
        <GiftForms />
        <div className="cols">
          <div className="prose"><h3>Christmas last order dates</h3><ChristmasDates /></div>
          <div className="prose"><h3>Giving a single bag?</h3>
            <p>Tick “This is a gift” on any bag page to add a printed message. We leave the price off the packing slip.</p>
            <p><Link className="btn ghost" href="/shop">Shop coffee</Link></p></div>
        </div>
      </section>
    </>
  );
}
