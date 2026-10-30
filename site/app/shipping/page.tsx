import type { Metadata } from "next";
import { DISPATCH_CUTOFF, SHIPPING } from "@/content/settings";
import ChristmasDates from "@/components/ChristmasDates";
import { gbp } from "@/lib/cart";

export const metadata: Metadata = { title: "Shipping Policy", description: "Delivery rates and times for Isaac's Coffee. Free UK delivery on coffee over £35, or collect free in St Margarets." };

const fee = (p: number) => (p === 0 ? "Free" : gbp(p));

export default function Shipping() {
  return (
    <>
      <div className="wrap page-head"><p className="eyebrow">Policy</p><h1>Shipping policy and rates</h1>
        <p>We roast in small batches and post Monday to Friday. Orders placed before {DISPATCH_CUTOFF} on a weekday leave the same day.</p></div>
      <section className="block wrap" style={{ display: "grid", gap: "2.5rem" }}>
        <div className="table-wrap"><table className="rates">
          <thead><tr><th>Service</th><th>Arrives</th><th>Coffee under £35</th><th>£35 and over</th></tr></thead>
          <tbody>{Object.values(SHIPPING).map((s) => (
            <tr key={s.label}><td>{s.label}</td><td>{s.days}</td><td className={s.under === 0 ? "free" : ""}>{fee(s.under)}</td><td className={s.over === 0 ? "free" : ""}>{fee(s.over)}</td></tr>
          ))}</tbody>
        </table></div>
        <div className="cols">
          <div className="prose">
            <h3>Christmas last order dates</h3><ChristmasDates />
            <h3>Where we deliver</h3><p>UK mainland, Northern Ireland, Isle of Man and Channel Islands. Highlands and islands may take one extra day. We don&apos;t ship outside the UK yet.</p>
            <h3>Subscriptions</h3><p>Each subscription box is charged the same rates, based on the value of the box. Boxes of £35 or more ship free. Your cart shows the delivery charge before you pay.</p>
            <h3>Gifts</h3><p>Gift subscriptions include delivery. Gift cards arrive by email, so they need no delivery.</p>
          </div>
          <div className="prose">
            <h3>Tracking</h3><p>You get a tracking number by email as soon as your order ships.</p>
            <h3>Lost or damaged parcels</h3><p>Email us within 7 days of the expected delivery date with your order number. We&apos;ll replace or refund it.</p>
            <h3>Collection</h3><p>We email you when your order is ready. Bring your order email. We hold orders for 14 days.</p>
          </div>
        </div>
      </section>
    </>
  );
}
