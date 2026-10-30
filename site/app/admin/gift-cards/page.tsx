import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { gbp } from "@/lib/cart";
import { db, giftCards } from "@/lib/db";
import { normaliseCode } from "@/lib/giftcards";
import AdminNav from "../AdminNav";

export const metadata: Metadata = { title: "Gift cards", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function GiftCards({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const code = normaliseCode((await searchParams).code ?? "");
  const [card] = code ? await db().select().from(giftCards).where(eq(giftCards.code, code)).limit(1) : [];
  return (
    <div className="wrap admin">
      <AdminNav current="/admin/gift-cards" />
      <h1>Gift card lookup</h1>
      <form className="dispatch" style={{ margin: "1rem 0 2rem" }}>
        <input name="code" defaultValue={code} placeholder="ISAAC-XXXX-XXXX" aria-label="Gift card code" />
        <button className="btn">Look up</button>
      </form>
      {code && !card && <p className="msg err">No gift card with code {code}.</p>}
      {card && (
        <dl className="specs">
          <div><dt>Balance</dt><dd>{gbp(card.balance)} of {gbp(card.initialAmount)}</dd></div>
          <div><dt>For</dt><dd>{card.recipientName ?? ""} {card.recipientEmail}</dd></div>
          <div><dt>From</dt><dd>{card.purchaserEmail}</dd></div>
          <div><dt>Emailed</dt><dd>{card.sentAt ? card.sentAt.toLocaleDateString("en-GB") : `Scheduled for ${card.sendOn}`}</dd></div>
        </dl>
      )}
    </div>
  );
}
