import { NextResponse } from "next/server";
import { withErrors } from "@/lib/api";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db, reviews } from "@/lib/db";
import { readToken } from "@/lib/tokens";

const Body = z.object({
  token: z.string(),
  name: z.string().trim().min(1).max(60),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(2000),
});

export const POST = withErrors(async (req: Request) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Add your name, a star rating and at least a sentence." }, { status: 400 });
  const subject = readToken("review", parsed.data.token);
  if (!subject) return NextResponse.json({ ok: false, message: "This review link has expired. Reply to the email and we'll send a new one." }, { status: 400 });
  const [shipmentId, productSlug, email] = subject.split("|");
  const dupe = await db().select({ id: reviews.id }).from(reviews)
    .where(and(eq(reviews.shipmentId, shipmentId), eq(reviews.productSlug, productSlug))).limit(1);
  if (dupe.length) return NextResponse.json({ ok: false, message: "You've already reviewed this bag. Thank you." });
  await db().insert(reviews).values({ shipmentId, productSlug, email, name: parsed.data.name, rating: parsed.data.rating, body: parsed.data.body });
  return NextResponse.json({ ok: true, message: "Thank you. Your review appears once we've read it." });
});
