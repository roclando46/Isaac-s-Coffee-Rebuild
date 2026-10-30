import type { Metadata } from "next";
import AccountForm from "@/components/AccountForm";

export const metadata: Metadata = { title: "My Subscription", robots: { index: false } };

export default async function Account({ searchParams }: { searchParams: Promise<{ expired?: string }> }) {
  const { expired } = await searchParams;
  return (
    <div className="wrap page-head narrow">
      <p className="eyebrow">Your account</p>
      <h1>Manage your subscription</h1>
      <p>Enter the email you ordered with. We&apos;ll email a link to change your card, see receipts or cancel. No password needed.</p>
      {expired && <p className="msg err" style={{ marginTop: "1rem" }}>That link has expired. Ask for a new one below.</p>}
      <AccountForm />
    </div>
  );
}
