import { NextResponse } from "next/server";
import { withErrors } from "@/lib/api";
import { z } from "zod";
import { sendMail } from "@/lib/email/send";
import { portalLink } from "@/lib/email/templates";
import { siteUrl, stripe } from "@/lib/stripe";
import { makeToken } from "@/lib/tokens";

const Body = z.object({ email: z.string().trim().toLowerCase().email() });

/** Emails a sign-in link to the Stripe customer portal. Same reply whether or not the email has an account. */
export const POST = withErrors(async (req: Request) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Enter the email you ordered with." }, { status: 400 });
  const { email } = parsed.data;
  const { data } = await stripe().customers.list({ email, limit: 1 });
  if (data[0]) {
    const url = `${siteUrl()}/account/open?t=${makeToken("portal", data[0].id, 1 / 24)}`;
    await sendMail({ to: email, ...portalLink(email, url) });
  }
  return NextResponse.json({ ok: true, message: `If ${email} has an account, a sign-in link is on its way. It works for 1 hour.` });
});
