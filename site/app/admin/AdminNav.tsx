import Link from "next/link";
import { logout } from "./actions";

export default function AdminNav({ current }: { current: string }) {
  const links = [["/admin", "To pack"], ["/admin/drinks", "Drinks"], ["/admin/reviews", "Reviews"], ["/admin/gift-cards", "Gift cards"]];
  return (
    <nav className="admin-nav" aria-label="Admin">
      {links.map(([href, label]) => (
        <Link key={href} href={href} aria-current={current === href ? "page" : undefined}>{label}</Link>
      ))}
      <form action={logout}><button className="linklike">Sign out</button></form>
    </nav>
  );
}
