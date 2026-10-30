"use client";
import { useEffect, useState } from "react";
import { setDrinkStatus } from "../actions";

type Row = { id: string; number: number; name: string; pickup: string; status: "paid" | "ready"; lines: string[] };

/** Refreshes every 15 seconds so the bar always sees new orders. */
export default function DrinksBoard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    const load = () => fetch("/api/admin/drinks").then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { if (live) { setRows(d.orders); setError(""); } })
      .catch(() => live && setError("Can't reach the server. Retrying…"));
    load();
    const t = setInterval(load, 15_000);
    return () => { live = false; clearInterval(t); };
  }, []);

  if (rows === null) return <p className="muted">Loading orders…</p>;
  return (
    <>
      {error && <p className="msg err" role="alert">{error}</p>}
      {rows.length === 0 && <p className="muted">No drinks waiting. New orders appear here within 15 seconds.</p>}
      <div className="parcels">
        {rows.map((o) => (
          <article key={o.id} className={`parcel ${o.status === "ready" ? "is-ready" : ""}`}>
            <header><b className="pickup">{o.pickup}</b><span>{o.name} · #{o.number}</span></header>
            <ul>{o.lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
            <form action={async (f) => { await setDrinkStatus(f); setRows((r) => r && r.map((x) => x.id === o.id ? { ...x, status: f.get("status") === "ready" ? "ready" : x.status } : x).filter((x) => !(x.id === o.id && f.get("status") === "collected"))); }}>
              <input type="hidden" name="id" value={o.id} />
              {o.status === "paid"
                ? <button className="btn" name="status" value="ready">Ready</button>
                : <button className="btn ghost" name="status" value="collected">Collected</button>}
            </form>
          </article>
        ))}
      </div>
    </>
  );
}
