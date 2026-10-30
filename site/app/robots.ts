import type { MetadataRoute } from "next";
import { SHOP } from "@/content/settings";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/account", "/thanks", "/review", "/unsubscribe"] },
    sitemap: `${SHOP.url}/sitemap.xml`,
  };
}
