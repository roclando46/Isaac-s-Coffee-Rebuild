import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/content/products";
import { SHOP } from "@/content/settings";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/shop", "/subscribe", "/gifts", "/order-ahead", "/contact", "/shipping", "/refunds", "/privacy", "/terms"];
  return [
    ...pages.map((p) => ({ url: `${SHOP.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...PRODUCTS.map((p) => ({ url: `${SHOP.url}/coffee/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.9 })),
  ];
}
