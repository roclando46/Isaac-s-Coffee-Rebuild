import type { NextConfig } from "next";

// Old Shopify addresses, so Google rankings, bookmarks and printed QR codes keep working.
const SHOPIFY_PRODUCTS: Record<string, string> = {
  "isaacs-dark-velvet-blend": "/coffee/house-blend",
  "isaacs-decaf": "/coffee/brazilian-bold-decaf",
  "blue-mountain-harmony": "/coffee/blue-mountain-harmony",
  "south-american-fusion": "/coffee/south-american-fusion",
  "matcha": "/order-ahead",
  "iced-matcha": "/order-ahead",
  "iced-drinks": "/order-ahead",
  "iced-drinks-copy": "/order-ahead",
};

const config: NextConfig = {
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  async redirects() {
    return [
      ...Object.entries(SHOPIFY_PRODUCTS).flatMap(([from, to]) => [
        { source: `/products/${from}`, destination: to, permanent: true },
        { source: `/collections/:c/products/${from}`, destination: to, permanent: true },
      ]),
      { source: "/products/:any*", destination: "/shop", permanent: true },
      { source: "/collections/pickup-in-store", destination: "/order-ahead", permanent: true },
      { source: "/collections/:any*", destination: "/shop", permanent: true },
      { source: "/pages/contact", destination: "/contact", permanent: true },
      { source: "/pages/subscribe", destination: "/subscribe", permanent: true },
      { source: "/pages/gifts", destination: "/gifts", permanent: true },
      { source: "/pages/:any*", destination: "/", permanent: true },
      { source: "/policies/shipping-policy", destination: "/shipping", permanent: true },
      { source: "/policies/refund-policy", destination: "/refunds", permanent: true },
      { source: "/policies/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/policies/terms-of-service", destination: "/terms", permanent: true },
      { source: "/cart", destination: "/shop?cart=open", permanent: false },
      { source: "/account/login", destination: "/account", permanent: true },
    ];
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
};

export default config;
