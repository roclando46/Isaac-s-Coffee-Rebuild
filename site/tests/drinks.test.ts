import { describe, expect, it } from "vitest";
import { drinkPrice, pickupSlots } from "@/lib/drinks";

describe("drinks", () => {
  it("adds 40p for plant milk", () => {
    expect(drinkPrice("latte", "Regular", "Whole")).toBe(390);
    expect(drinkPrice("latte", "Large", "Oat")).toBe(450);
    expect(drinkPrice("iced-white-chocolate-matcha", "Large", "Coconut")).toBe(610);
  });
  it("refuses options a drink does not have", () => {
    expect(() => drinkPrice("flat-white", "Large", "Whole")).toThrow();
    expect(() => drinkPrice("iced-black", "Regular", "Oat")).toThrow();
  });
  it("offers slots from 10 minutes ahead until 15 minutes before closing", () => {
    // Wednesday 4 Nov 2026, 09:03 UK time (GMT)
    const slots = pickupSlots(new Date("2026-11-04T09:03:00Z"));
    expect(slots[0]).toBe("09:20");
    expect(slots.at(-1)).toBe("15:40");
  });
  it("starts at opening time before the café opens", () => {
    expect(pickupSlots(new Date("2026-11-08T06:00:00Z"))[0]).toBe("09:00"); // Sunday
  });
  it("has no slots after closing", () => {
    expect(pickupSlots(new Date("2026-11-04T16:30:00Z"))).toEqual([]);
  });
  it("uses UK summer time", () => {
    // Wed 1 July 2026, 08:00 UTC is 09:00 BST
    expect(pickupSlots(new Date("2026-07-01T08:00:00Z"))[0]).toBe("09:10");
  });
});
