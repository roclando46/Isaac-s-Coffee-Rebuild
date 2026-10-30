"use client";
import { useEffect, useMemo, useState } from "react";
import { DRINKS, type DrinkSize, type Milk } from "@/content/drinks";
import { gbp } from "@/lib/cart";
import { drinkPrice, type DrinkLine } from "@/lib/drinks";
import { useSubmit } from "./useSubmit";

const CATEGORIES = ["Hot coffee", "Iced coffee", "Matcha", "Iced matcha"] as const;

export default function DrinksOrder() {
  const [choice, setChoice] = useState<Record<string, { size: DrinkSize; milk: Milk }>>({});
  const [lines, setLines] = useState<DrinkLine[]>([]);
  const [slots, setSlots] = useState<string[] | null>(null);
  const [pickup, setPickup] = useState("");
  const [name, setName] = useState("");
  const { submit, result, setResult, pending } = useSubmit("/api/drinks/checkout");

  useEffect(() => {
    fetch("/api/drinks/slots").then((r) => r.json()).then((d) => { setSlots(d.slots); setPickup(d.slots[0] ?? ""); }).catch(() => setSlots([]));
  }, []);

  const total = useMemo(() => lines.reduce((s, l) => s + drinkPrice(l.id, l.size, l.milk) * l.qty, 0), [lines]);
  const pick = (id: string) => choice[id] ?? { size: "Regular" as DrinkSize, milk: DRINKS.find((d) => d.id === id)!.milks[0] };

  function addLine(id: string) {
    const c = pick(id);
    setLines((cur) => {
      const i = cur.findIndex((l) => l.id === id && l.size === c.size && l.milk === c.milk);
      if (i === -1) return [...cur, { id, ...c, qty: 1 }];
      const next = [...cur];
      next[i] = { ...next[i], qty: Math.min(10, next[i].qty + 1) };
      return next;
    });
    setResult(null);
  }

  const closed = slots !== null && slots.length === 0;
  return (
    <>
      <section className="block wrap" style={{ display: "grid", gap: "2.5rem" }}>
        {closed && <p className="notice">Order-ahead is closed for today. You can still browse the menu, and ordering opens again when the café opens.</p>}
        {CATEGORIES.map((cat) => (
          <div key={cat}>
            <h2 style={{ marginBottom: "1rem" }}>{cat}</h2>
            <div className="menu-grid">
              {DRINKS.filter((d) => d.category === cat).map((d) => {
                const c = pick(d.id);
                return (
                  <div className="drink" key={d.id}>
                    <h3><span>{d.name}</span><span>{gbp(drinkPrice(d.id, c.size, c.milk))}</span></h3>
                    <div className="row">
                      <select aria-label={`${d.name} size`} value={c.size} onChange={(e) => setChoice({ ...choice, [d.id]: { ...c, size: e.target.value as DrinkSize } })}>
                        {(Object.keys(d.prices) as DrinkSize[]).map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <select aria-label={`${d.name} milk`} value={c.milk} onChange={(e) => setChoice({ ...choice, [d.id]: { ...c, milk: e.target.value as Milk } })}>
                        {d.milks.map((m) => <option key={m}>{m}</option>)}
                      </select>
                    </div>
                    <button className="btn ghost" type="button" onClick={() => addLine(d.id)} disabled={closed}>Add</button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
      {lines.length > 0 && (
        <div className="order-bar"><div className="wrap">
          <div>
            <b>Your order · {gbp(total)}</b>
            <ul>{lines.map((l, i) => (
              <li key={i}>{l.qty} × {DRINKS.find((d) => d.id === l.id)?.name}, {l.size}, {l.milk} <button className="rm linklike small" onClick={() => setLines(lines.filter((_, n) => n !== i))}>Remove</button></li>
            ))}</ul>
          </div>
          <form className="controls" onSubmit={async (e) => {
            e.preventDefault();
            if (!name.trim()) return setResult({ ok: false, message: "Add a name for the cup." });
            const r = await submit({ lines, pickup, name });
            const url = (r as { url?: string } | null)?.url;
            if (url) location.href = url;
          }}>
            <div className="field"><label htmlFor="dName">Name for the cup</label><input id="dName" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" /></div>
            <div className="field"><label htmlFor="dTime">Collect at</label>
              <select id="dTime" value={pickup} onChange={(e) => setPickup(e.target.value)}>{(slots ?? []).map((s) => <option key={s}>{s}</option>)}</select></div>
            <button className="btn" disabled={pending || !pickup}>{pending ? "Opening checkout…" : `Pay ${gbp(total)}`}</button>
          </form>
          {result && !result.ok && <p className="msg err" role="alert" style={{ width: "100%" }}>{result.message}</p>}
        </div></div>
      )}
    </>
  );
}
