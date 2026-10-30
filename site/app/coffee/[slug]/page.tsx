import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BREW_GUIDE, PRODUCTS, getProduct } from "@/content/products";
import { SHIPPING, SHOP } from "@/content/settings";
import BrewGuide from "@/components/BrewGuide";
import BuyBox from "@/components/BuyBox";
import Gallery from "@/components/Gallery";
import ProductCard from "@/components/ProductCard";
import { gbp } from "@/lib/cart";
import { approvedReviews } from "@/lib/reviews";

export const revalidate = 600;
export const generateStaticParams = () => PRODUCTS.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  return {
    title: `${p.name} Coffee Beans`,
    description: `${p.name}: ${p.notes.toLowerCase()}. Roast ${p.roast} of 5. Whole bean or ground, from ${gbp(p.prices["250g"])}. Roasted for Isaac's Coffee, St Margarets.`,
    openGraph: { images: [p.photos[0].src] },
  };
}

function Beans({ n }: { n: number }) {
  return <span className="beans" aria-hidden="true">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={n >= i ? "f" : n >= i - 0.5 ? "h" : ""} />)}</span>;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const reviews = await approvedReviews(p.slug);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const schema = {
    "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.blurb,
    image: p.photos.map((ph) => `${SHOP.url}${ph.src}`), brand: { "@type": "Brand", name: "Isaac's Coffee" },
    offers: { "@type": "AggregateOffer", priceCurrency: "GBP", lowPrice: (p.prices["250g"] / 100).toFixed(2), highPrice: (p.prices["1kg"] / 100).toFixed(2), availability: "https://schema.org/InStock" },
    ...(reviews.length ? {
      aggregateRating: { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: reviews.length },
      review: reviews.slice(0, 5).map((r) => ({ "@type": "Review", author: { "@type": "Person", name: r.name }, reviewRating: { "@type": "Rating", ratingValue: r.rating }, reviewBody: r.body })),
    } : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="wrap crumbs"><Link href="/">Home</Link> / <Link href="/shop">Shop coffee</Link> / {p.name}</div>
      <div className="wrap pdp">
        <Gallery photos={p.photos} />
        <div className="buy">
          <div><p className="vendor">Isaac&apos;s Coffee · {p.notes}</p><h1 style={{ marginTop: ".4rem" }}>{p.name}</h1>
            {reviews.length > 0 && <p className="small"><a href="#reviews">{"★".repeat(Math.round(avg))} {avg.toFixed(1)} from {reviews.length} review{reviews.length > 1 ? "s" : ""}</a></p>}
          </div>
          <BuyBox product={{ slug: p.slug, prices: p.prices, inStock: p.inStock }} />
          <p>{p.blurb}</p>
          <dl className="specs">
            {!p.originDraft && <div><dt>Origin</dt><dd>{p.origin}</dd></div>}
            <div><dt>Roast level</dt><dd><Beans n={p.roast} />{p.roast} of 5 · {p.roastLabel}</dd></div>
            <div><dt>Roast date</dt><dd>Printed on every bag</dd></div>
            {!p.processDraft && <div><dt>Process</dt><dd>{p.process}</dd></div>}
            <div><dt>Tasting notes</dt><dd>{p.notes}</dd></div>
            <div><dt>Best for</dt><dd>{p.best}</dd></div>
          </dl>
          <div>
            <details className="acc" open><summary>Brew guide</summary><div className="in brew"><BrewGuide guide={BREW_GUIDE} /></div></details>
            <details className="acc"><summary>Freshness and storage</summary><div className="in"><p>Rest beans 5 to 7 days after the roast date for espresso, 3 days for filter. Best within 6 weeks. Keep the bag sealed, away from light and heat. No fridge.</p></div></details>
            <details className="acc"><summary>Delivery and collection</summary><div className="in"><p>{SHIPPING.tracked48.label} {gbp(SHIPPING.tracked48.under)}, free on coffee over £35. {SHIPPING.tracked24.label} {gbp(SHIPPING.tracked24.under)}. Free click and collect in St Margarets. <Link href="/shipping">Full shipping policy</Link>.</p></div></details>
          </div>
        </div>
      </div>
      <section className="wrap reviews" id="reviews">
        <div className="sec-head" style={{ marginBottom: "1rem" }}><h2>Reviews</h2></div>
        {reviews.length === 0
          ? <div className="box"><div><span className="stars" aria-hidden="true">★★★★★</span> <span className="muted">No reviews yet</span><p style={{ marginTop: ".3rem" }}>Bought this bag? We email you 7 days after it's posted to ask how it's brewing.</p></div></div>
          : <div className="review-list">{reviews.map((r) => (
              <article key={r.id}><b aria-label={`${r.rating} out of 5 stars`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</b><p>{r.body}</p><p className="muted small">{r.name}, {r.createdAt.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p></article>
            ))}</div>}
      </section>
      <section className="wrap block" style={{ paddingTop: 0 }}>
        <div className="sec-head"><h2>You might also like</h2></div>
        <div className="grid4">{PRODUCTS.filter((x) => x !== p).map((x) => <ProductCard key={x.slug} p={x} />)}</div>
      </section>
    </>
  );
}
