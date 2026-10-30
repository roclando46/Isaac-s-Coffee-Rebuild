import { NextResponse } from "next/server";
import { siteUrl, stripe } from "@/lib/stripe";
import { readToken } from "@/lib/tokens";

export async function GET(req: Request) {
  const customer = readToken("portal", new URL(req.url).searchParams.get("t"));
  if (!customer) return NextResponse.redirect(`${siteUrl()}/account?expired=1`);
  const session = await stripe().billingPortal.sessions.create({ customer, return_url: `${siteUrl()}/account` });
  return NextResponse.redirect(session.url);
}
