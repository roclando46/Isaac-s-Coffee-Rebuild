"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, DeliveryMethod } from "@/lib/cart";

type Cart = {
  items: CartItem[];
  delivery: DeliveryMethod;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: CartItem) => void;
  remove: (index: number) => void;
  setDelivery: (d: DeliveryMethod) => void;
  clear: () => void;
};

const Ctx = createContext<Cart | null>(null);
const KEY = "ic_cart_v1";

const sameLine = (a: CartItem, b: CartItem) =>
  a.type === "bag" && b.type === "bag" && a.slug === b.slug && a.size === b.size && a.grind === b.grind &&
  a.purchase === b.purchase && a.weeks === b.weeks && a.giftMessage === b.giftMessage;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [delivery, setDelivery] = useState<DeliveryMethod>("tracked48");
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
      if (saved?.items) setItems(saved.items);
      if (saved?.delivery) setDelivery(saved.delivery);
    } catch {}
    setLoaded(true);
    if (new URLSearchParams(location.search).get("cart") === "open") setOpen(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify({ items, delivery })); } catch {}
  }, [items, delivery, loaded]);

  const add = useCallback((item: CartItem) => {
    setItems((cur) => {
      const i = cur.findIndex((c) => sameLine(c, item));
      if (i === -1) return [...cur, item];
      const next = [...cur];
      next[i] = { ...next[i], qty: Math.min(10, next[i].qty + item.qty) } as CartItem;
      return next;
    });
    setOpen(true);
  }, []);

  const value = useMemo<Cart>(() => ({
    items, delivery, open, setOpen, add, setDelivery,
    count: items.reduce((n, i) => n + i.qty, 0),
    remove: (index) => setItems((cur) => cur.filter((_, i) => i !== index)),
    clear: () => setItems([]),
  }), [items, delivery, open, add]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
