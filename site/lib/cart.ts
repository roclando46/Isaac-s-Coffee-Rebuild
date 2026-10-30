// Cart types, validation and pricing. Shared by the browser (display) and the server (charging),
// so the totals a customer sees are the totals Stripe charges. All money in pence.
import { z } from "zod";
import { GRINDS, SIZES, getProduct } from "@/content/products";
import {
  FREE_SHIPPING_THRESHOLD,
  GIFT_CARD_AMOUNTS,
  GIFT_SUBSCRIPTION,
  SHIPPING,
  SUBSCRIPTION_DISCOUNT,
} from "@/content/settings";

const message = z.string().trim().max(200).optional().default("");

export const BagItem = z.object({
  type: z.literal("bag"),
  slug: z.string(),
  size: z.enum(SIZES),
  grind: z.enum(GRINDS),
  purchase: z.enum(["once", "sub"]),
  weeks: z.union([z.literal(2), z.literal(4)]).optional(),
  qty: z.number().int().min(1).max(10),
  giftMessage: message,
});

export const GiftCardItem = z.object({
  type: z.literal("giftcard"),
  amount: z.number().int().refine((n) => GIFT_CARD_AMOUNTS.includes(n), "Choose a listed amount"),
  recipientEmail: z.string().trim().email(),
  recipientName: z.string().trim().max(80).optional().default(""),
  sendOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  message,
  qty: z.literal(1),
});

export const Address = z.object({
  line1: z.string().trim().min(1).max(100),
  line2: z.string().trim().max(100).optional().default(""),
  city: z.string().trim().min(1).max(60),
  postcode: z.string().trim().regex(/^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/, "Enter a UK postcode"),
});
export type Address = z.infer<typeof Address>;

export const GiftSubItem = z.object({
  type: z.literal("giftsub"),
  months: z.union([z.literal(3), z.literal(6)]),
  slug: z.string(),
  grind: z.enum(GRINDS),
  recipientName: z.string().trim().min(1).max(80),
  address: Address,
  message,
  qty: z.literal(1),
});

export const CartItem = z.discriminatedUnion("type", [BagItem, GiftCardItem, GiftSubItem]);
export type CartItem = z.infer<typeof CartItem>;
export type BagItem = z.infer<typeof BagItem>;
export type GiftCardItem = z.infer<typeof GiftCardItem>;
export type GiftSubItem = z.infer<typeof GiftSubItem>;

export const DeliveryMethod = z.enum(["tracked48", "tracked24", "collect"]);
export type DeliveryMethod = z.infer<typeof DeliveryMethod>;

export const CheckoutRequest = z.object({
  items: z.array(CartItem).min(1).max(30),
  delivery: DeliveryMethod,
  code: z.string().trim().max(40).optional().default(""),
});
export type CheckoutRequest = z.infer<typeof CheckoutRequest>;

export const subPrice = (pence: number) => Math.round(pence * (1 - SUBSCRIPTION_DISCOUNT));

export function unitPrice(item: CartItem): number {
  switch (item.type) {
    case "bag": {
      const p = getProduct(item.slug);
      if (!p) throw new Error(`Unknown coffee: ${item.slug}`);
      const base = p.prices[item.size];
      return item.purchase === "sub" ? subPrice(base) : base;
    }
    case "giftcard":
      return item.amount;
    case "giftsub":
      return GIFT_SUBSCRIPTION[item.months].price;
  }
}

export const lineTotal = (item: CartItem) => unitPrice(item) * item.qty;

export function itemTitle(item: CartItem): string {
  switch (item.type) {
    case "bag":
      return getProduct(item.slug)?.name ?? item.slug;
    case "giftcard":
      return `Gift card £${item.amount / 100}`;
    case "giftsub":
      return `Gift subscription, ${item.months} months`;
  }
}

export function itemDetail(item: CartItem): string {
  switch (item.type) {
    case "bag":
      return [
        item.size,
        item.grind,
        item.purchase === "sub" ? `Every ${item.weeks} weeks, 10% off` : "One-time",
        item.giftMessage ? "Gift message added" : "",
      ].filter(Boolean).join(" · ");
    case "giftcard":
      return `To ${item.recipientEmail}, sent ${formatDay(item.sendOn)}`;
    case "giftsub":
      return `${getProduct(item.slug)?.name ?? item.slug}, 250g, ${item.grind} · For ${item.recipientName} · Delivery included`;
  }
}

export function formatDay(isoDate: string) {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Weeks shared by every subscription line, or null if there are none. Throws on a mix. */
export function subscriptionWeeks(items: CartItem[]): 2 | 4 | null {
  const weeks = new Set(items.flatMap((i) => (i.type === "bag" && i.purchase === "sub" ? [i.weeks ?? 4] : [])));
  if (weeks.size > 1) throw new CartError("All subscriptions in one order need the same delivery rhythm. Set them all to every 2 or every 4 weeks.");
  return weeks.size ? ([...weeks][0] as 2 | 4) : null;
}

export class CartError extends Error {}

const deliveryFee = (method: DeliveryMethod, goods: number) => {
  const rate = SHIPPING[method];
  return goods >= FREE_SHIPPING_THRESHOLD ? rate.over : rate.under;
};

export type Quote = {
  subtotal: number; // everything in the cart
  coffeeOnce: number; // one-off bags
  coffeeSub: number; // subscription bags, charged every cycle
  needsDelivery: boolean;
  firstDelivery: number; // one-off delivery charge on this order
  recurringDelivery: number; // delivery charge added to each subscription cycle
  total: number; // before any code
  toFreeDelivery: number; // pence of coffee still needed for free delivery, 0 if none
  weeks: 2 | 4 | null;
};

/**
 * Delivery rules:
 * - Gift cards are emailed and gift subscriptions include delivery, so neither needs delivery.
 * - Coffee of £35 or more on one order ships free (Tracked 24 reduced).
 * - A subscription's own delivery charge repeats each cycle, priced on the subscription's value.
 *   On the first order the customer pays the larger of that charge and the whole order's charge, never both.
 */
export function quote(items: CartItem[], method: DeliveryMethod): Quote {
  const weeks = subscriptionWeeks(items);
  let coffeeOnce = 0;
  let coffeeSub = 0;
  let subtotal = 0;
  for (const item of items) {
    const t = lineTotal(item);
    subtotal += t;
    if (item.type === "bag") item.purchase === "sub" ? (coffeeSub += t) : (coffeeOnce += t);
  }
  const coffee = coffeeOnce + coffeeSub;
  const needsDelivery = coffee > 0;
  let firstDelivery = 0;
  let recurringDelivery = 0;
  if (needsDelivery && method !== "collect") {
    recurringDelivery = coffeeSub > 0 ? deliveryFee(method, coffeeSub) : 0;
    firstDelivery = Math.max(0, deliveryFee(method, coffee) - recurringDelivery);
  }
  return {
    subtotal,
    coffeeOnce,
    coffeeSub,
    needsDelivery,
    firstDelivery,
    recurringDelivery,
    total: subtotal + firstDelivery + recurringDelivery,
    toFreeDelivery: needsDelivery ? Math.max(0, FREE_SHIPPING_THRESHOLD - coffee) : 0,
    weeks,
  };
}

export const gbp = (pence: number) => `£${(pence / 100).toFixed(2)}`;
