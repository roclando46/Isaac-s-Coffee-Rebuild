import Image from "next/image";
import Link from "next/link";
import { DRINKS } from "@/content/drinks";
import { PRODUCTS } from "@/content/products";
import { HERO_VIDEO, SHOP } from "@/content/settings";
import ProductCard from "@/components/ProductCard";
import { gbp } from "@/lib/cart";

const FEATURED_DRINKS = ["iced-matcha", "latte", "matcha-latte"].map((id) => DRINKS.find((d) => d.id === id)!);

export default function Home() {
  return (
    <>
      <div className="wrap">
        <section className="hero2" aria-label="Welcome">
          {HERO_VIDEO
            ? <video className="hero-video" src={HERO_VIDEO} poster="/images/cafe-bar.webp" autoPlay muted loop playsInline />
            : <Image src="/images/cafe-bar.webp" alt="Baristas making coffee behind the bar at Isaac's Coffee, St Margarets" width={900} height={600} priority sizes="(max-width:1180px) 100vw, 1180px" />}
          <div className="over">
            <p className="eyebrow" style={{ color: "var(--fg)" }}>St Margarets, TW1 · Family-run</p>
            <h1>Speciality coffee and matcha from St Margarets</h1>
            <div className="ctas"><Link className="btn" href="/shop">Shop coffee</Link><Link className="btn ghost" href="/subscribe">Subscribe and save 10%</Link></div>
          </div>
        </section>
        <div className="hero-facts">
          <span><b>4 blends</b>whole bean or ground</span>
          <span><b>From £11.25</b>per bag on subscription</span>
          <span><b>Free UK delivery</b>on coffee over £35</span>
          <span><b>Gifts</b><Link href="/gifts">Gift subscriptions and cards</Link></span>
        </div>
      </div>
      <section className="block wrap">
        <div className="sec-head"><h2>Shop our coffee</h2><Link href="/shop">View all</Link></div>
        <div className="grid4">{PRODUCTS.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </section>
      <section className="band"><div className="wrap block">
        <div className="split">
          <div>
            <p className="eyebrow">Coffee subscription</p>
            <h2 style={{ marginTop: ".5rem" }}>Never run out. Save 10% on every bag.</h2>
            <p style={{ marginTop: "1rem", maxWidth: "32rem" }}>Pick a blend, a grind and how often. We roast, pack and post it every 2 or 4 weeks. Cancel any time from your account.</p>
            <div style={{ display: "flex", gap: ".75rem", marginTop: "1.5rem", flexWrap: "wrap" }}><Link className="btn" href="/subscribe">Start a subscription</Link></div>
          </div>
          <div className="steps" style={{ marginTop: 0 }}>
            <div><b>1. Choose</b><span className="muted">Blend, bag size and grind.</span></div>
            <div><b>2. Set the rhythm</b><span className="muted">Every 2 or 4 weeks.</span></div>
            <div><b>3. Save 10%</b><span className="muted">On every delivery, for as long as you stay.</span></div>
          </div>
        </div>
      </div></section>
      <section className="block wrap">
        <div className="sec-head"><h2>Order ahead</h2><Link href="/order-ahead">See the full menu</Link></div>
        <div className="grid4">
          {FEATURED_DRINKS.map((d) => (
            <Link key={d.id} className="card" href="/order-ahead">
              <div className="ph" style={{ aspectRatio: 1 }}><Image src={d.image} alt={d.imageAlt} width={400} height={400} sizes="(max-width:900px) 50vw, 25vw" /></div>
              <h3>{d.name}</h3><p className="price">From {gbp(d.prices.Regular!)}</p>
            </Link>
          ))}
          <Link className="card" href="/contact">
            <div className="ph" style={{ aspectRatio: 1, display: "grid", placeItems: "center", padding: "1.5rem", textAlign: "center" }}>
              <span><b style={{ font: "400 1.5rem/1.2 var(--serif)" }}>{SHOP.address.line1}</b><br /><span className="muted">{SHOP.landmark}</span></span>
            </div>
            <h3>Find us</h3><p className="price">{SHOP.address.postcode}</p>
          </Link>
        </div>
      </section>
      <section className="block wrap" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="split">
          <div><p className="eyebrow">About us</p><h2 style={{ marginTop: ".5rem" }}>Great coffee. Exceptional matcha. Local connections.</h2></div>
          <div className="prose">
            <p>Isaac&apos;s Coffee is an independent, family-run café in St Margarets, serving Twickenham and Richmond.</p>
            <p>We&apos;re known for speciality coffee and some of the best ceremonial-grade matcha in the area. Our basement café is a cosy place to meet friends, work, or grab a perfectly pulled espresso on the way to the train.</p>
          </div>
        </div>
      </section>
    </>
  );
}
