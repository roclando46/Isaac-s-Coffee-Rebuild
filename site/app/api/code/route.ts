import { NextResponse } from "next/server";
import { withErrors } from "@/lib/api";
import { z } from "zod";
import { gbp } from "@/lib/cart";
import { resolveCode } from "@/lib/orders/codes";

const Body = z.object({ code: z.string().max(40), total: z.number().int().min(0) });

/** Checks a code in the cart before checkout, without creating anything in Stripe. */
export const POST = withErrors(async (req: Request) => {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, message: "Enter a code." }, { status: 400 });
  const r = await resolveCode(parsed.data.code, parsed.data.total, { createCoupon: false });
  if (r.kind === "invalid") return NextResponse.json({ ok: false, message: r.message });
  if (r.kind === "gift") return NextResponse.json({ ok: true, message: `Gift card: ${gbp(r.applied)} off this order. ${gbp(r.balance - r.applied)} stays on the card.` });
  if (r.kind === "promo") return NextResponse.json({ ok: true, message: `${r.label} applies at checkout.` });
  return NextResponse.json({ ok: false, message: "Enter a code." });
});
