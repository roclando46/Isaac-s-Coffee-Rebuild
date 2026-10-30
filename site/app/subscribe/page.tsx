import type { Metadata } from "next";
import { PRODUCTS, SIZES } from "@/content/products";
import ProductCard from "@/components/ProductCard";
import { gbp, subPrice } from "@/lib/cart";

export const metadata: Metadata = { title: "Coffee Subscription, 10% Off", description: "Fresh speciality coffee from St Margarets every 2 or 4 weeks, 10% off every bag. Cancel any time." };

export default function Subscribe() {
  const rows = [["blend", PRODUCTS[0]], ["decaf", PRODUCTS[1]]] as const;
  return (
    <>
      <div className="wrap page-head"><p className="eyebrow">Coffee subscription</p><h1>Fresh beans every 2 or 4 weeks. 10% off, always.</h1>
        <p>Choose any blend below. Subscribe is pre-selected on every bag. Change your card or cancel from your account, no fees.</p></div>
      <section className="block wrap">
        <div className="cols" style={{ marginBottom: "2.5rem" }}>
          <div className="table-wrap"><table className="rates">
            <thead><tr><th>Bag</th><th>One-time</th><th>Subscription</th><th>You save</th></tr></thead>
            <tbody>{rows.flatMap(([label, p]) => SIZES.map((s) => (
              <tr key={label + s}><td>{s} {label}</td><td>{gbp(p.prices[s])}</td><td className="free">{gbp(subPrice(p.prices[s]))}</td><td>{gbp(p.prices[s] - subPrice(p.prices[s]))}</td></tr>
            )))}</tbody>
          </table></div>
          <div className="prose">
            <h3>How it works</h3>
            <p>A 500g subscription costs {gbp(subPrice(2400))} and covers about 30 cups. Two 500g bags every 4 weeks comes to {gbp(subPrice(2400) * 2)}, which ships free.</p>
            <p>Picked up the QR code from your table? Welcome. The beans in your cup today are the House Blend.</p>
          </div>
        </div>
        <div className="grid4">{PRODUCTS.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </section>
    </>
  );
}
