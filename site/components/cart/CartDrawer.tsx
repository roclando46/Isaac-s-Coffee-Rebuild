"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getProduct } from "@/content/products";
import { FREE_SHIPPING_THRESHOLD, SHIPPING } from "@/content/settings";
import { CartError, gbp, itemDetail, itemTitle, lineTotal, quote, type CartItem, type DeliveryMethod } from "@/lib/cart";
import { useSubmit } from "../useSubmit";
import { useCart } from "./CartProvider";

const thumb = (item: CartItem) =>
  item.type === "giftcard" ? "/images/house-blend-bag.webp" : getProduct(item.slug)?.photos[0].src ?? "/images/house-blend-label.webp";

export default function CartDrawer() {
  const { items, delivery, setDelivery, remove, open, setOpen, count } = useCart();
  const path = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [code, setCode] = useState("");
  const codeCheck = useSubmit("/api/code");
  const checkout = useSubmit("/api/checkout");

  useEffect(() => setOpen(false), [path, setOpen]);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open, setOpen]);

  let q: ReturnType<typeof quote> | null = null;
  let cartError = "";
  try { q = count ? quote(items, delivery) : null; } catch (e) { cartError = e instanceof CartError ? e.message : "Your cart has an item we no longer sell. Remove it to continue."; }

  async function goToCheckout() {
    const r = await checkout.submit({ items, delivery, code });
    const url = (r as { url?: string } | null)?.url;
    if (url) location.href = url;
  }

  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={() => setOpen(false)} />
      <aside className="drawer" aria-label="Cart" role="dialog" aria-modal="true">
        <header><h3>Your cart</h3><button ref={closeRef} className="x" onClick={() => setOpen(false)} aria-label="Close cart">×</button></header>
        <div className="scroll">
          {q?.needsDelivery && (
            <div>
              <p style={{ fontSize: ".9rem", marginBottom: ".5rem" }}>
                {q.toFreeDelivery === 0 ? <b>Your coffee ships free.</b> : <>Add <b>{gbp(q.toFreeDelivery)}</b> of coffee for free UK delivery.</>}
              </p>
              <div className="bar"><i style={{ width: `${Math.min(100, ((q.coffeeOnce + q.coffeeSub) / FREE_SHIPPING_THRESHOLD) * 100)}%` }} /></div>
            </div>
          )}
          {count === 0 && <p className="muted">Your cart is empty. <Link href="/shop">Shop coffee</Link></p>}
          <div className="lines">
            {items.map((item, i) => (
              <div className="line" key={i}>
                <Image src={thumb(item)} alt="" width={56} height={70} />
                <div>
                  <b>{itemTitle(item)}</b><br />
                  <span className="muted">{itemDetail(item)}</span><br />
                  Qty {item.qty} · <button className="rm" onClick={() => remove(i)}>Remove</button>
                </div>
                <b>{gbp(lineTotal(item))}</b>
              </div>
            ))}
          </div>
          {cartError && <p className="msg err" role="alert">{cartError}</p>}
          {q?.needsDelivery && (
            <fieldset className="delivery-opts">
              <legend>Delivery</legend>
              {(Object.keys(SHIPPING) as DeliveryMethod[]).map((m) => {
                const fee = quote(items, m);
                const cost = fee.firstDelivery + fee.recurringDelivery;
                return (
                  <label key={m}>
                    <span><input type="radio" name="delivery" checked={delivery === m} onChange={() => setDelivery(m)} />{SHIPPING[m].label}</span>
                    <span>{cost === 0 ? "Free" : gbp(cost)}</span>
                  </label>
                );
              })}
            </fieldset>
          )}
          {count > 0 && (
            <div>
              <form className="codeform" onSubmit={(e) => { e.preventDefault(); if (code.trim() && q) codeCheck.submit({ code, total: q.total }); }}>
                <label htmlFor="cartCode" className="sr-only">Discount or gift card code</label>
                <input id="cartCode" placeholder="Discount or gift card code" value={code} onChange={(e) => { setCode(e.target.value); codeCheck.setResult(null); }} autoCapitalize="characters" />
                <button disabled={codeCheck.pending}>Apply</button>
              </form>
              {codeCheck.result && <p className={`msg ${codeCheck.result.ok ? "ok" : "err"}`} role="status">{codeCheck.result.message}</p>}
            </div>
          )}
        </div>
        {q && (
          <div className="totals">
            <div><span>Subtotal</span><span>{gbp(q.subtotal)}</span></div>
            {q.needsDelivery && <div><span>Delivery{q.recurringDelivery ? ", repeats each box" : ""}</span><span>{q.firstDelivery + q.recurringDelivery === 0 ? "Free" : gbp(q.firstDelivery + q.recurringDelivery)}</span></div>}
            <div className="grand"><span>Total today</span><span>{gbp(q.total)}</span></div>
            {q.weeks && <p className="muted small">Then {gbp(q.coffeeSub + q.recurringDelivery)} every {q.weeks} weeks. Cancel any time.</p>}
            {code && <p className="muted small">Your code comes off at checkout.</p>}
          </div>
        )}
        {checkout.result && !checkout.result.ok && <p className="msg err" role="alert">{checkout.result.message}</p>}
        <button className="btn" disabled={!q || checkout.pending} onClick={goToCheckout}>{checkout.pending ? "Opening secure checkout…" : "Check out"}</button>
      </aside>
    </>
  );
}
