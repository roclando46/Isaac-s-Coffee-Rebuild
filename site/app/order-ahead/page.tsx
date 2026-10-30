import type { Metadata } from "next";
import { SHOP } from "@/content/settings";
import DrinksOrder from "@/components/DrinksOrder";

export const metadata: Metadata = { title: "Order Ahead: Coffee and Matcha", description: "Order coffee and matcha ahead and collect from Isaac's Coffee, opposite St Margarets station. Pay online, skip the queue." };

export default function OrderAhead() {
  return (
    <>
      <div className="wrap page-head"><p className="eyebrow">Click and collect</p><h1>Order ahead, skip the queue</h1>
        <p>Pick your drinks and a collection time, pay online, and collect from {SHOP.address.line1}. Plant milks are 40p extra.</p></div>
      <DrinksOrder />
    </>
  );
}
