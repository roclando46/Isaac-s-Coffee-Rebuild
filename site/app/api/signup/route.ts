import { NextResponse } from "next/server";
import { withErrors } from "@/lib/api";
import { z } from "zod";
import { db, subscribers } from "@/lib/db";
import { sendMail } from "@/lib/email/send";
import { confirmSignup } from "@/lib/email/templates";

const Body = z.object({ email: z.string().trim().toLowerCase().email() });

/** Double opt-in: store as pending and email a confirmation link. The welcome code goes out after confirming. */
export const POST = withErrors(async (req: Request) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Enter an email like name@example.com." }, { status: 400 });
  const { email } = parsed.data;
  const [row] = await db().insert(subscribers).values({ email, status: "pending", source: "footer" })
    .onConflictDoNothing().returning();
  if (row || (await db().query.subscribers.findFirst({ where: (s, { eq }) => eq(s.email, email) }))?.status !== "active") {
    await sendMail({ to: email, ...confirmSignup(email) });
  }
  return NextResponse.json({ ok: true, message: `Check ${email} and click the link to get your 10% code.` });
});
