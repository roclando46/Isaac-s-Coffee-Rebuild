import type { Metadata } from "next";
import { getProduct } from "@/content/products";
import ReviewForm from "@/components/ReviewForm";
import { readToken } from "@/lib/tokens";

export const metadata: Metadata = { title: "Write a review", robots: { index: false } };

export default async function Review({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  const subject = readToken("review", t);
  const product = subject ? getProduct(subject.split("|")[1]) : undefined;
  return (
    <div className="wrap page-head narrow">
      <p className="eyebrow">Review</p>
      {product && t ? <><h1>How&apos;s your {product.name}?</h1><ReviewForm token={t} /></>
        : <><h1>This link has expired</h1><p>Reply to the review email and we&apos;ll send a new one.</p></>}
    </div>
  );
}
