import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap page-head narrow">
      <p className="eyebrow">404</p>
      <h1>We can&apos;t find that page</h1>
      <p>It may have moved when we rebuilt the site.</p>
      <p style={{ marginTop: "1.5rem", display: "flex", gap: ".75rem", flexWrap: "wrap" }}><Link className="btn" href="/shop">Shop coffee</Link><Link className="btn ghost" href="/">Home</Link></p>
    </div>
  );
}
