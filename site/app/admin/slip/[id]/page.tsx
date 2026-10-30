import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { SHOP } from "@/content/settings";
import { isAdmin } from "@/lib/auth";
import { db, shipments } from "@/lib/db";
import type { ParcelItem, StoredAddress } from "@/lib/orders/fulfil";

export const metadata: Metadata = { title: "Packing slip", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Printable packing slip. Shows no prices, so it works for gifts. */
export default async function Slip({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const [s] = await db().select().from(shipments).where(eq(shipments.id, id)).limit(1);
  if (!s) notFound();
  const a = s.address as StoredAddress | null;
  return (
    <div className="slip">
      <h1>Isaac&apos;s Coffee</h1>
      <p className="muted">{SHOP.address.line1}, {SHOP.address.town} {SHOP.address.postcode}</p>
      {a && <p className="addr">{a.name}<br />{a.line1}{a.line2 ? <><br />{a.line2}</> : null}<br />{a.city} {a.postcode}</p>}
      <ul>{(s.items as ParcelItem[]).map((i, n) => <li key={n}>{i.qty} × {i.name}, {i.size}, {i.grind}</li>)}</ul>
      {s.giftMessage && <blockquote>{s.giftMessage}</blockquote>}
      <p className="muted">Enjoy your coffee. Rest the beans 5 to 7 days after roasting for espresso.</p>
    </div>
  );
}
