"use client";
import { useState } from "react";
import { GRINDS, SIZES, type Grind, type Product, type Size } from "@/content/products";
import { FREE_SHIPPING_THRESHOLD } from "@/content/settings";
import { gbp, lineTotal, subPrice } from "@/lib/cart";
import { useCart } from "./cart/CartProvider";

export default function BuyBox({ product: p }: { product: Product }) {
  const { add, items } = useCart();
  const [size, setSize] = useState<Size>("250g");
  const [grind, setGrind] = useState<Grind>("Whole Bean");
  const [purchase, setPurchase] = useState<"sub" | "once">("sub");
  const existingSub = items.find((i) => i.type === "bag" && i.purchase === "sub");
  const existingWeeks = existingSub?.type === "bag" ? existingSub.weeks : undefined;
  const [weeks, setWeeks] = useState<2 | 4>(existingWeeks ?? 4);
  const [qty, setQty] = useState(1);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");

  const base = p.prices[size];
  const unit = purchase === "sub" ? subPrice(base) : base;
  const coffeeInCart = items.reduce((s, i) => s + (i.type === "bag" ? lineTotal(i) : 0), 0);
  const left = FREE_SHIPPING_THRESHOLD - coffeeInCart - unit * qty;
  const rhythmClash = purchase === "sub" && existingWeeks !== undefined && existingWeeks !== weeks;

  return (
    <form style={{ display: "grid", gap: "1.25rem" }} onSubmit={(e) => {
      e.preventDefault();
      add({ type: "bag", slug: p.slug, size, grind, purchase, weeks: purchase === "sub" ? weeks : undefined, qty, giftMessage: isGift ? giftMessage.trim() || "A gift for you" : "" });
      setQty(1);
    }}>
      <div>
        <div className="priceline">
          {purchase === "sub"
            ? <><span className="now">{gbp(unit)}</span><span className="was">{gbp(base)}</span><span className="tag">Save {gbp(base - unit)} every {weeks} weeks</span></>
            : <span className="now">{gbp(base)}</span>}
        </div>
        <p className="taxnote">Taxes included. Free UK delivery on coffee over £35.</p>
      </div>
      <fieldset><legend>Bag size</legend><div className="pills">
        {SIZES.map((s) => <label key={s}><input type="radio" name="size" checked={size === s} onChange={() => setSize(s)} /><span>{s}</span></label>)}
      </div></fieldset>
      <fieldset><legend>Grind</legend><div className="pills">
        {GRINDS.map((g) => <label key={g}><input type="radio" name="grind" checked={grind === g} onChange={() => setGrind(g)} /><span>{g}</span></label>)}
      </div></fieldset>
      <fieldset className="ptype"><legend>Purchase options</legend>
        <label className="opt">
          <input type="radio" name="ptype" checked={purchase === "sub"} onChange={() => setPurchase("sub")} />
          <span><span className="t">Subscribe and save 10%</span><br /><span className="d">Cancel any time from your account.</span><br />
            <select aria-label="Delivery frequency" value={weeks} onChange={(e) => { setWeeks(Number(e.target.value) as 2 | 4); setPurchase("sub"); }}>
              <option value={2}>Deliver every 2 weeks</option><option value={4}>Deliver every 4 weeks</option>
            </select></span>
          <span className="p">{gbp(subPrice(base))}</span>
        </label>
        <label className="opt">
          <input type="radio" name="ptype" checked={purchase === "once"} onChange={() => setPurchase("once")} />
          <span><span className="t">One-time purchase</span></span><span className="p">{gbp(base)}</span>
        </label>
      </fieldset>
      {rhythmClash && <p className="msg err">Your cart has a subscription every {existingWeeks} weeks. One order can only have one rhythm, so choose every {existingWeeks} weeks here too.</p>}
      <p className="stock">{p.inStock ? `In stock: ${size}, ${grind}. Roasted to order, ships in 1 to 2 working days.` : "Out of stock. Back after the next roast."}</p>
      <div className="qtyrow">
        <div className="qty">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
          <output aria-live="polite">{qty}</output>
          <button type="button" aria-label="Increase quantity" onClick={() => setQty(Math.min(10, qty + 1))}>+</button>
        </div>
        <button className="btn" type="submit" disabled={!p.inStock || rhythmClash}>{purchase === "sub" ? "Subscribe" : "Add to cart"}</button>
      </div>
      <p className="ship-hint">{left <= 0 ? <><b>This order ships free.</b> Free UK delivery on coffee over £35.</> : <>Add {gbp(left)} more coffee for free UK delivery.</>}</p>
      <div className="giftbox">
        <label className="chk" htmlFor="isGift"><input type="checkbox" id="isGift" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} />This is a gift</label>
        {isGift && <div className="field"><label htmlFor="giftMsg">Gift message, printed on a card. We leave the price off.</label>
          <textarea id="giftMsg" rows={2} maxLength={200} value={giftMessage} onChange={(e) => setGiftMessage(e.target.value)} /></div>}
      </div>
    </form>
  );
}
