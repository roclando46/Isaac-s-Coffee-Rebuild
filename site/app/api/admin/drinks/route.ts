import { NextResponse } from "next/server";
import { and, eq, gte, ne } from "drizzle-orm";
import { getDrink } from "@/content/drinks";
import { isAdmin } from "@/lib/auth";
import { db, orders } from "@/lib/db";
import type { DrinkLine } from "@/lib/drinks";

export const dynamic = "force-dynamic";

/** Today's drinks orders that haven't been collected, earliest collection first. */
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Sign in" }, { status: 401 });
  const since = new Date(Date.now() - 18 * 3600_000);
  const rows = await db().select().from(orders)
    .where(and(eq(orders.kind, "drinks"), ne(orders.status, "collected"), gte(orders.createdAt, since)));
  rows.sort((a, b) => (a.pickupAt ?? "").localeCompare(b.pickupAt ?? ""));
  return NextResponse.json({
    orders: rows.map((o) => ({
      id: o.id, number: o.number, name: o.name, pickup: o.pickupAt, status: o.status,
      lines: (o.items as DrinkLine[]).map((l) => `${l.qty} × ${getDrink(l.id)?.name ?? l.id}, ${l.size}, ${l.milk}`),
    })),
  });
}
