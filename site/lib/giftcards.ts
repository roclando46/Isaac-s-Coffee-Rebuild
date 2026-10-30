import { randomInt } from "node:crypto";

// No 0/O, 1/I/L, so codes read cleanly from a card or screen.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function newGiftCode(): string {
  const block = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  return `ISAAC-${block()}-${block()}`;
}

export const normaliseCode = (code: string) => code.trim().toUpperCase().replace(/\s+/g, "");

export const looksLikeGiftCode = (code: string) => /^ISAAC-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(normaliseCode(code));

/** Amount of a gift card to apply to an order: never more than the balance or the order. */
export const giftCardApplies = (balance: number, orderTotal: number) => Math.max(0, Math.min(balance, orderTotal));
