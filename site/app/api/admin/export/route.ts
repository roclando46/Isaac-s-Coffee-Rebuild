import { NextResponse } from "next/server";
import { and, eq, lte, ne } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { db, shipments } from "@/lib/db";
import { todayUK, type ParcelItem, type StoredAddress } from "@/lib/orders/fulfil";

const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;

/** Parcels due today as CSV. Map the columns once in Click and Drop's import settings. */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const rows = await db().select().from(shipments)
    .where(and(eq(shipments.status, "due"), lte(shipments.dueOn, todayUK()), ne(shipments.delivery, "collect")));
  const head = ["Reference", "Name", "Address line 1", "Address line 2", "Town", "Postcode", "Country", "Email", "Service", "Contents", "Weight (g)"];
  const lines = rows.map((s) => {
    const a = (s.address ?? {}) as Partial<StoredAddress>;
    const items = s.items as ParcelItem[];
    const grams = items.reduce((g, i) => g + i.qty * ({ "250g": 300, "500g": 560, "1kg": 1080 }[i.size] ?? 300), 0);
    return [s.id.slice(0, 8), a.name ?? s.name ?? "", a.line1 ?? "", a.line2 ?? "", a.city ?? "", a.postcode ?? "", "GB", s.email,
      s.delivery === "tracked24" ? "Tracked 24" : "Tracked 48", items.map((i) => `${i.qty}x ${i.name} ${i.size}`).join("; "), String(grams)].map(cell).join(",");
  });
  return new NextResponse([head.map(cell).join(","), ...lines].join("\r\n"), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="isaacs-parcels-${todayUK()}.csv"` },
  });
}
