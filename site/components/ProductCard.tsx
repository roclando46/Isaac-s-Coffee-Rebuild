import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/content/products";
import { gbp, subPrice } from "@/lib/cart";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link className="card" href={`/coffee/${p.slug}`}>
      <div className="ph"><Image src={p.photos[0].src} alt={p.photos[0].alt} width={450} height={577} sizes="(max-width:900px) 50vw, 25vw" /></div>
      <h3>{p.name}</h3>
      <p className="notes">{p.notes}</p>
      <p className="price">From {gbp(p.prices["250g"])}</p>
      <p className="sub">Or {gbp(subPrice(p.prices["250g"]))} on subscription</p>
    </Link>
  );
}
