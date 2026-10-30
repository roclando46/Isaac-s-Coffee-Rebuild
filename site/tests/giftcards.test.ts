import { describe, expect, it } from "vitest";
import { giftCardApplies, looksLikeGiftCode, newGiftCode, normaliseCode } from "@/lib/giftcards";

describe("gift cards", () => {
  it("makes readable unique codes", () => {
    const codes = new Set(Array.from({ length: 500 }, newGiftCode));
    expect(codes.size).toBe(500);
    for (const c of codes) expect(looksLikeGiftCode(c)).toBe(true);
  });
  it("tells gift codes from promo codes", () => {
    expect(looksLikeGiftCode(" isaac-abcd-ef23 ")).toBe(true);
    expect(looksLikeGiftCode("WELCOME10")).toBe(false);
    expect(normaliseCode(" isaac-ab cd ")).toBe("ISAAC-ABCD");
  });
  it("never applies more than the balance or the order", () => {
    expect(giftCardApplies(2500, 1645)).toBe(1645);
    expect(giftCardApplies(1000, 1645)).toBe(1000);
    expect(giftCardApplies(0, 1645)).toBe(0);
  });
});
