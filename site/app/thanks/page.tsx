import type { Metadata } from "next";
import Link from "next/link";
import ClearCart from "@/components/cart/ClearCart";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

export default async function Thanks({ searchParams }: { searchParams: Promise<{ drinks?: string }> }) {
  const drinks = (await searchParams).drinks === "1";
  return (
    <div className="wrap page-head narrow">
      {!drinks && <ClearCart />}
      <p className="eyebrow">Order confirmed</p>
      <h1>{drinks ? "Your drinks are ordered" : "Thank you for your order"}</h1>
      <p>{drinks
        ? "We've emailed your receipt. Give your name at the counter when you arrive."
        : "We've emailed your receipt. We'll email again when your coffee ships, with a tracking number, or when it's ready to collect."}</p>
      <p style={{ marginTop: "1.5rem" }}><Link className="btn ghost" href="/">Back to the shop</Link></p>
    </div>
  );
}
