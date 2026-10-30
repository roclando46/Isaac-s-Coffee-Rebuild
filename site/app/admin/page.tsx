import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, asc, desc, eq, lte } from "drizzle-orm";
import { SHIPPING } from "@/content/settings";
import { isAdmin } from "@/lib/auth";
import { db, shipments } from "@/lib/db";
import type { ParcelItem, StoredAddress } from "@/lib/orders/fulfil";
import { todayUK } from "@/lib/orders/fulfil";
import AdminNav from "./AdminNav";
import { markDispatched } from "./actions";

export const metadata: Metadata = { title: "To pack", robots: { index: false } };
export const dynamic = "force-dynamic";

const SOURCE = { order: "New order", renewal: "Subscription", giftsub: "Gift subscription" } as const;

export default async function AdminHome() {
  if (!(await isAdmin())) redirect("/admin/login");
  const due = await db().select().from(shipments)
    .where(and(eq(shipments.status, "due"), lte(shipments.dueOn, todayUK()))).orderBy(asc(shipments.dueOn), asc(shipments.createdAt));
  const recent = await db().select().from(shipments).where(eq(shipments.status, "dispatched")).orderBy(desc(shipments.dispatchedAt)).limit(15);

  return (
    <div className="wrap admin">
      <AdminNav current="/admin" />
      <div className="sec-head">
        <h1>To pack today ({due.length})</h1>
        {due.length > 0 && <a className="btn ghost" href="/api/admin/export">Download Click and Drop CSV</a>}
      </div>
      {due.length === 0 && <p className="muted">Nothing to pack. New orders, subscription boxes and gift subscription boxes appear here on the day they're due.</p>}
      <div className="parcels">
        {due.map((s) => {
          const a = s.address as StoredAddress | null;
          return (
            <article key={s.id} className="parcel">
              <header>
                <span className="chip">{SOURCE[s.source]}</span>
                <span className="muted">{SHIPPING[s.delivery as keyof typeof SHIPPING]?.label ?? s.delivery} · due {s.dueOn}</span>
              </header>
              <ul>{(s.items as ParcelItem[]).map((i, n) => <li key={n}><b>{i.qty} × {i.name}</b> {i.size}, {i.grind}</li>)}</ul>
              {a ? <p className="addr">{a.name}<br />{a.line1}{a.line2 ? <><br />{a.line2}</> : null}<br />{a.city} {a.postcode}</p> : <p className="addr">{s.name ?? s.email} · collecting in store</p>}
              {s.giftMessage && <p className="gift">Gift message: “{s.giftMessage}”</p>}
              <p className="muted small">{s.email}</p>
              <form action={markDispatched} className="dispatch">
                <input type="hidden" name="id" value={s.id} />
                {s.delivery !== "collect" && <input name="tracking" placeholder="Tracking number" aria-label="Tracking number" />}
                <button className="btn">{s.delivery === "collect" ? "Ready, email customer" : "Posted, email tracking"}</button>
                <Link href={`/admin/slip/${s.id}`} className="small">Packing slip</Link>
              </form>
            </article>
          );
        })}
      </div>
      {recent.length > 0 && (
        <section style={{ marginTop: "3rem" }}>
          <h2>Recently sent</h2>
          <div className="table-wrap"><table className="rates">
            <thead><tr><th>Sent</th><th>Customer</th><th>Items</th><th>Tracking</th></tr></thead>
            <tbody>{recent.map((s) => (
              <tr key={s.id}><td>{s.dispatchedAt?.toLocaleDateString("en-GB")}</td><td>{s.name ?? s.email}</td>
                <td>{(s.items as ParcelItem[]).map((i) => `${i.qty} × ${i.name}`).join(", ")}</td><td>{s.trackingNumber ?? "–"}</td></tr>
            ))}</tbody>
          </table></div>
        </section>
      )}
    </div>
  );
}
