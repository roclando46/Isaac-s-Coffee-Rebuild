import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getProduct } from "@/content/products";
import { isAdmin } from "@/lib/auth";
import { db, reviews } from "@/lib/db";
import AdminNav from "../AdminNav";
import { moderateReview } from "../actions";

export const metadata: Metadata = { title: "Reviews", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Reviews() {
  if (!(await isAdmin())) redirect("/admin/login");
  const pending = await db().select().from(reviews).where(eq(reviews.status, "pending")).orderBy(desc(reviews.createdAt));
  return (
    <div className="wrap admin">
      <AdminNav current="/admin/reviews" />
      <h1>Reviews to check ({pending.length})</h1>
      {pending.length === 0 && <p className="muted">No new reviews. Customers get a review request 7 days after their parcel is posted.</p>}
      <div className="parcels">
        {pending.map((r) => (
          <article key={r.id} className="parcel">
            <header><b>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</b><span className="muted">{getProduct(r.productSlug)?.name}</span></header>
            <p>{r.body}</p>
            <p className="muted small">{r.name} · {r.email}</p>
            <form action={moderateReview} className="dispatch">
              <input type="hidden" name="id" value={r.id} />
              <button className="btn" name="status" value="approved">Publish</button>
              <button className="btn ghost" name="status" value="rejected">Hide</button>
            </form>
          </article>
        ))}
      </div>
    </div>
  );
}
