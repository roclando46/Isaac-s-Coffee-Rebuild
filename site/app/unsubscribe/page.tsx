import type { Metadata } from "next";
import { optOuts, subscribers, db } from "@/lib/db";
import { readToken } from "@/lib/tokens";

export const metadata: Metadata = { title: "Email preferences", robots: { index: false } };

async function unsubscribe(form: FormData) {
  "use server";
  const t = String(form.get("t"));
  const marketing = readToken("unsub", t);
  const service = readToken("optout", t);
  const email = marketing ?? service;
  if (!email) return;
  if (marketing) {
    await db().insert(subscribers).values({ email, status: "unsubscribed", source: "footer" })
      .onConflictDoUpdate({ target: subscribers.email, set: { status: "unsubscribed" } });
  }
  await db().insert(optOuts).values({ email }).onConflictDoNothing();
  const { redirect } = await import("next/navigation");
  redirect("/unsubscribe?done=1");
}

export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ t?: string; done?: string }> }) {
  const { t, done } = await searchParams;
  if (done) return <div className="wrap page-head narrow"><h1>You&apos;re unsubscribed</h1><p>You won&apos;t get these emails again. Order emails and receipts still arrive.</p></div>;
  const valid = Boolean(readToken("unsub", t) ?? readToken("optout", t));
  return (
    <div className="wrap page-head narrow">
      <h1>Stop these emails?</h1>
      {valid ? (
        <form action={unsubscribe} style={{ marginTop: "1.5rem" }}>
          <input type="hidden" name="t" value={t} />
          <p>You&apos;ll stop getting offers, reorder reminders and review requests. Receipts and delivery emails still arrive.</p>
          <p style={{ marginTop: "1rem" }}><button className="btn">Unsubscribe</button></p>
        </form>
      ) : <p>This link has expired. Reply to any of our emails and we&apos;ll take you off the list.</p>}
    </div>
  );
}
