// Turns a code typed in the cart into a Stripe discount: a gift card becomes a one-time coupon
// for what the card covers, anything else is looked up as a Stripe promotion code (such as WELCOME10).
import { and, eq, gt } from "drizzle-orm";
import { db, giftCards } from "@/lib/db";
import { giftCardApplies, looksLikeGiftCode, normaliseCode } from "@/lib/giftcards";
import { stripe } from "@/lib/stripe";

export type CodeResult =
  | { kind: "none" }
  | { kind: "gift"; giftCardId: string; applied: number; balance: number; couponId?: string }
  | { kind: "promo"; promotionCodeId: string; label: string }
  | { kind: "invalid"; message: string };

export async function resolveCode(raw: string, orderTotal: number, { createCoupon }: { createCoupon: boolean }): Promise<CodeResult> {
  const code = normaliseCode(raw);
  if (!code) return { kind: "none" };

  if (looksLikeGiftCode(code)) {
    const [card] = await db().select().from(giftCards).where(and(eq(giftCards.code, code), gt(giftCards.balance, 0))).limit(1);
    if (!card) return { kind: "invalid", message: "That gift card has no balance left, or the code is wrong." };
    const applied = giftCardApplies(card.balance, orderTotal);
    let couponId: string | undefined;
    if (createCoupon && applied > 0) {
      const coupon = await stripe().coupons.create({
        amount_off: applied, currency: "gbp", duration: "once", max_redemptions: 1,
        name: `Gift card ${code.slice(-4)}`, metadata: { giftCardId: card.id },
      });
      couponId = coupon.id;
    }
    return { kind: "gift", giftCardId: card.id, applied, balance: card.balance, couponId };
  }

  const { data } = await stripe().promotionCodes.list({ code, active: true, limit: 1 });
  const promo = data[0];
  if (!promo) return { kind: "invalid", message: "That code isn't valid. Check the spelling, or it may have expired." };
  return { kind: "promo", promotionCodeId: promo.id, label: code };
}
