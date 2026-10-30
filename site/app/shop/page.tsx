import type { Metadata } from "next";
import { PRODUCTS } from "@/content/products";
import ProductCard from "@/components/ProductCard";

export const metadata: Metadata = { title: "Shop Coffee Beans", description: "Four speciality coffee blends from Isaac's Coffee, St Margarets. Whole bean or ground, 250g to 1kg. Subscribe for 10% off." };

export default function Shop() {
  return (
    <>
      <div className="wrap page-head"><p className="eyebrow">Coffee beans</p><h1>Shop coffee</h1>
        <p>Every bag comes whole bean or ground for filter or espresso, in 250g, 500g or 1kg. Subscribe for 10% off, or buy once.</p></div>
      <section className="block wrap"><div className="grid4">{PRODUCTS.map((p) => <ProductCard key={p.slug} p={p} />)}</div></section>
    </>
  );
}
