import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, subscribers } from "@/lib/db";
import { sendMail } from "@/lib/email/send";
import { welcome } from "@/lib/email/templates";
import { siteUrl } from "@/lib/stripe";
import { readToken } from "@/lib/tokens";

export async function GET(req: Request) {
  const email = readToken("signup", new URL(req.url).searchParams.get("t"));
  if (!email) return NextResponse.redirect(`${siteUrl()}/signed-up?status=expired`);
  const [row] = await db().select().from(subscribers).where(eq(subscribers.email, email)).limit(1);
  if (row?.status !== "active") {
    await db().insert(subscribers).values({ email, status: "active", source: "footer", confirmedAt: new Date() })
      .onConflictDoUpdate({ target: subscribers.email, set: { status: "active", confirmedAt: new Date() } });
    await sendMail({ to: email, ...welcome(email) });
  }
  return NextResponse.redirect(`${siteUrl()}/signed-up?status=ok`);
}
