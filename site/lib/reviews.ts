import { and, desc, eq } from "drizzle-orm";
import { db, hasDb, reviews } from "@/lib/db";

export type PublicReview = { id: string; name: string; rating: number; body: string; createdAt: Date };

/** Approved reviews for a coffee. Empty when the database isn't connected yet. */
export async function approvedReviews(slug: string): Promise<PublicReview[]> {
  if (!hasDb()) return [];
  try {
    return await db().select({ id: reviews.id, name: reviews.name, rating: reviews.rating, body: reviews.body, createdAt: reviews.createdAt })
      .from(reviews).where(and(eq(reviews.productSlug, slug), eq(reviews.status, "approved"))).orderBy(desc(reviews.createdAt)).limit(20);
  } catch (e) {
    console.error("Reviews unavailable", e);
    return [];
  }
}
