import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Email confirmed", robots: { index: false } };

export default async function SignedUp({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const ok = (await searchParams).status === "ok";
  return (
    <div className="wrap page-head narrow">
      <h1>{ok ? "You're on the list" : "That link has expired"}</h1>
      <p>{ok ? "Your 10% welcome code is in your inbox." : "Sign up again at the bottom of any page and we'll send a fresh link."}</p>
      <p style={{ marginTop: "1.5rem" }}><Link className="btn" href="/shop">Shop coffee</Link></p>
    </div>
  );
}
