"use client";
import Image from "next/image";
import { useState } from "react";
import { GRINDS, PRODUCTS, type Grind } from "@/content/products";
import { GIFT_CARD_AMOUNTS, GIFT_SUBSCRIPTION } from "@/content/settings";
import { Address, gbp } from "@/lib/cart";
import { useCart } from "./cart/CartProvider";
import { isEmail } from "./useSubmit";

const todayUK = () => new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
type Msg = { ok: boolean; text: string } | null;

function SubForm() {
  const { add } = useCart();
  const [months, setMonths] = useState<3 | 6>(3);
  const [slug, setSlug] = useState(PRODUCTS[0].slug);
  const [grind, setGrind] = useState<Grind>("Whole Bean");
  const [name, setName] = useState("");
  const [addr, setAddr] = useState({ line1: "", line2: "", city: "", postcode: "" });
  const [message, setMessage] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  const field = (k: keyof typeof addr, label: string, auto: string) => (
    <div className="field"><label htmlFor={`gs-${k}`}>{label}</label>
      <input id={`gs-${k}`} autoComplete={`section-gift shipping ${auto}`} value={addr[k]} onChange={(e) => setAddr({ ...addr, [k]: e.target.value })} /></div>
  );
  return (
    <form className="giftcard" noValidate onSubmit={(e) => {
      e.preventDefault();
      if (!name.trim()) return setMsg({ ok: false, text: "Add their name for the card in the first box." });
      const a = Address.safeParse(addr);
      if (!a.success) return setMsg({ ok: false, text: "Add their full UK address, including a valid postcode." });
      add({ type: "giftsub", months, slug, grind, recipientName: name.trim(), address: a.data, message: message.trim(), qty: 1 });
      setMsg({ ok: true, text: "Added to your cart." });
    }}>
      <Image src="/images/house-blend-bag.webp" alt="Black Isaac's Coffee bag of House Blend standing on coffee beans in the café" width={900} height={1348} style={{ width: "100%", height: "auto", aspectRatio: "4/3", objectFit: "cover" }} />
      <div><h2>Gift subscription</h2><p className="muted" style={{ marginTop: ".4rem" }}>One 250g bag every 4 weeks, prepaid. Delivery included. No renewal, and they never need to enter card details.</p></div>
      <fieldset><legend>Length</legend><div className="pills">
        {([3, 6] as const).map((m) => <label key={m}><input type="radio" name="gsLen" checked={months === m} onChange={() => setMonths(m)} /><span>{m} months · {gbp(GIFT_SUBSCRIPTION[m].price)}</span></label>)}
      </div></fieldset>
      <fieldset><legend>Blend</legend><div className="pills">
        {PRODUCTS.map((p) => <label key={p.slug}><input type="radio" name="gsBlend" checked={slug === p.slug} onChange={() => setSlug(p.slug)} /><span>{p.name}</span></label>)}
      </div></fieldset>
      <fieldset><legend>Grind</legend><div className="pills">
        {GRINDS.map((g) => <label key={g}><input type="radio" name="gsGrind" checked={grind === g} onChange={() => setGrind(g)} /><span>{g}</span></label>)}
      </div></fieldset>
      <div className="field"><label htmlFor="gs-name">Their name</label><input id="gs-name" autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} /></div>
      {field("line1", "Address line 1", "address-line1")}
      {field("line2", "Address line 2 (optional)", "address-line2")}
      <div className="two" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: ".9rem" }}>{field("city", "Town", "address-level2")}{field("postcode", "Postcode", "postal-code")}</div>
      <div className="field"><label htmlFor="gs-msg">Gift message, printed on a card in the first box</label><textarea id="gs-msg" rows={3} maxLength={200} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
      <div><button className="btn" type="submit">Add gift subscription</button></div>
      {msg && <p className={`msg ${msg.ok ? "ok" : "err"}`} role="status">{msg.text}</p>}
    </form>
  );
}

function CardForm() {
  const { add } = useCart();
  const [amount, setAmount] = useState(2500);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sendOn, setSendOn] = useState(todayUK);
  const [message, setMessage] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  return (
    <form className="giftcard" noValidate onSubmit={(e) => {
      e.preventDefault();
      if (!isEmail(email)) return setMsg({ ok: false, text: "Add their email so the card reaches them." });
      if (sendOn < todayUK()) return setMsg({ ok: false, text: "Pick today or a later date." });
      add({ type: "giftcard", amount, recipientEmail: email.trim(), recipientName: name.trim(), sendOn, message: message.trim(), qty: 1 });
      setMsg({ ok: true, text: "Added to your cart." });
    }}>
      <div className="gc-face" aria-hidden="true"><span className="gc-logo" /><b>{gbp(amount).replace(".00", "")}</b><span className="muted" style={{ fontSize: ".8rem" }}>Isaac&apos;s Coffee gift card</span></div>
      <div><h2>Gift card</h2><p className="muted" style={{ marginTop: ".4rem" }}>Spend online on beans and subscriptions. Sent by email with your message. Any balance carries over. Never expires.</p></div>
      <fieldset><legend>Amount</legend><div className="pills">
        {GIFT_CARD_AMOUNTS.map((v) => <label key={v}><input type="radio" name="gcAmt" checked={amount === v} onChange={() => setAmount(v)} /><span>{gbp(v).replace(".00", "")}</span></label>)}
      </div></fieldset>
      <div className="field"><label htmlFor="gc-name">Their name (optional)</label><input id="gc-name" autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field"><label htmlFor="gc-email">Their email</label><input id="gc-email" type="email" autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="field"><label htmlFor="gc-date">Send on</label><input id="gc-date" type="date" min={todayUK()} value={sendOn} onChange={(e) => setSendOn(e.target.value)} /></div>
      <div className="field"><label htmlFor="gc-msg">Message</label><textarea id="gc-msg" rows={3} maxLength={200} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
      <div><button className="btn" type="submit">Add gift card</button></div>
      {msg && <p className={`msg ${msg.ok ? "ok" : "err"}`} role="status">{msg.text}</p>}
    </form>
  );
}

export default function GiftForms() {
  return <div className="giftgrid"><SubForm /><CardForm /></div>;
}
