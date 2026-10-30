import { NextResponse } from "next/server";
import { withErrors } from "@/lib/api";
import { z } from "zod";
import { SHOP } from "@/content/settings";
import { sendMail } from "@/lib/email/send";
import { contactMessage } from "@/lib/email/templates";

const Body = z.object({
  name: z.string().trim().max(80).default(""),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).default(""),
  message: z.string().trim().min(1).max(3000),
  website: z.string().max(0).optional(), // hidden field: bots fill it in
});

export const POST = withErrors(async (req: Request) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Add your email and a message." }, { status: 400 });
  await sendMail({ to: process.env.CAFE_INBOX ?? SHOP.email, replyTo: parsed.data.email, ...contactMessage(parsed.data) });
  return NextResponse.json({ ok: true, message: "Thanks. We reply within one working day." });
});
