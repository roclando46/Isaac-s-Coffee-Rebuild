import { describe, expect, it } from "vitest";
import { CartError, quote, subPrice, unitPrice, type CartItem } from "@/lib/cart";

const bag = (over: Partial<Extract<CartItem, { type: "bag" }>> = {}): CartItem => ({
  type: "bag", slug: "house-blend", size: "250g", grind: "Whole Bean", purchase: "once", qty: 1, giftMessage: "", ...over,
});

describe("prices", () => {
  it("takes 10% off subscriptions", () => {
    expect(subPrice(1250)).toBe(1125);
    expect(unitPrice(bag({ purchase: "sub", weeks: 4, size: "1kg" }))).toBe(3330);
    expect(unitPrice(bag({ slug: "brazilian-bold-decaf", purchase: "sub", weeks: 2 }))).toBe(1350);
  });
  it("rejects unknown coffee", () => {
    expect(() => unitPrice(bag({ slug: "nope" }))).toThrow();
  });
});

describe("delivery", () => {
  it("charges Tracked 48 under £35", () => {
    const q = quote([bag()], "tracked48");
    expect(q.firstDelivery).toBe(395);
    expect(q.total).toBe(1645);
    expect(q.toFreeDelivery).toBe(2250);
  });
  it("is free at £35 of coffee", () => {
    const q = quote([bag({ qty: 3 })], "tracked48");
    expect(q.subtotal).toBe(3750);
    expect(q.firstDelivery).toBe(0);
    expect(q.toFreeDelivery).toBe(0);
  });
  it("reduces Tracked 24 at £35", () => {
    expect(quote([bag({ qty: 3 })], "tracked24").firstDelivery).toBe(195);
  });
  it("is free for click and collect", () => {
    expect(quote([bag()], "collect").total).toBe(1250);
  });
  it("repeats delivery on a small subscription without double charging", () => {
    const q = quote([bag({ purchase: "sub", weeks: 4 })], "tracked48");
    expect(q.recurringDelivery).toBe(395);
    expect(q.firstDelivery).toBe(0);
    expect(q.total).toBe(1125 + 395);
  });
  it("ships a £35+ subscription free every time", () => {
    const q = quote([bag({ purchase: "sub", weeks: 2, size: "1kg", qty: 1 }), bag({ purchase: "sub", weeks: 2 })], "tracked48");
    expect(q.coffeeSub).toBe(3330 + 1125);
    expect(q.recurringDelivery).toBe(0);
    expect(q.firstDelivery).toBe(0);
  });
  it("needs no delivery for gift cards and gift subscriptions", () => {
    const q = quote([
      { type: "giftcard", amount: 2500, recipientEmail: "a@b.co", recipientName: "", sendOn: "2026-12-20", message: "", qty: 1 },
      { type: "giftsub", months: 3, slug: "house-blend", grind: "Filter", recipientName: "Sam", address: { line1: "1 High St", line2: "", city: "Twickenham", postcode: "TW1 3AA" }, message: "", qty: 1 },
    ], "tracked48");
    expect(q.needsDelivery).toBe(false);
    expect(q.total).toBe(2500 + 4500);
  });
  it("refuses mixed subscription rhythms", () => {
    expect(() => quote([bag({ purchase: "sub", weeks: 2 }), bag({ purchase: "sub", weeks: 4 })], "tracked48")).toThrow(CartError);
  });
});

describe("validation", () => {
  it("accepts UK postcodes and rejects others", async () => {
    const { Address } = await import("@/lib/cart");
    expect(Address.safeParse({ line1: "1 High St", city: "Twickenham", postcode: "TW1 2AA" }).success).toBe(true);
    expect(Address.safeParse({ line1: "1 High St", city: "London", postcode: "SW1A1AA" }).success).toBe(true);
    expect(Address.safeParse({ line1: "1 High St", city: "Paris", postcode: "75001" }).success).toBe(false);
  });
});
