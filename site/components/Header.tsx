"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./cart/CartProvider";

const NAV = [["/", "Home"], ["/shop", "Shop Coffee"], ["/subscribe", "Subscribe"], ["/gifts", "Gifts"], ["/order-ahead", "Order ahead"], ["/contact", "Contact"]];

export default function Header() {
  const path = usePathname();
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  useEffect(() => setMenu(false), [path]);
  if (path.startsWith("/admin/slip")) return null;
  const current = (href: string) => (href === "/" ? path === "/" : path.startsWith(href) || (href === "/shop" && path.startsWith("/coffee")));
  return (
    <header className="site"><div className="wrap">
      <button className="menu-btn" aria-expanded={menu} aria-controls="mainNav" onClick={() => setMenu(!menu)}>Menu</button>
      <nav className={`main ${menu ? "open" : ""}`} id="mainNav" aria-label="Main">
        {NAV.map(([href, label]) => <Link key={href} href={href} aria-current={current(href) ? "page" : undefined}>{label}</Link>)}
      </nav>
      <Link href="/" aria-label="Isaac's Coffee home"><span className="logo" role="img" aria-label="Isaac's Coffee" /></Link>
      <div className="head-right"><button className="cart-btn" onClick={() => setOpen(true)}>Cart ({count})</button></div>
    </div></header>
  );
}
