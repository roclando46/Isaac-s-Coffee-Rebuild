import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Ovo } from "next/font/google";
import { HOURS, SHOP } from "@/content/settings";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const serif = Ovo({ subsets: ["latin"], weight: "400", variable: "--font-serif", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SHOP.url),
  title: { default: "Isaac's Coffee | Speciality Coffee and Matcha, St Margarets TW1", template: "%s | Isaac's Coffee" },
  description: "Speciality coffee beans and ceremonial matcha from St Margarets, TW1. Delivered or collect in store.",
  openGraph: { siteName: "Isaac's Coffee", locale: "en_GB", type: "website", images: ["/images/cafe-bar.webp"] },
};

export const viewport: Viewport = { themeColor: "#000000", viewportFit: "cover" };

const DAY = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const localBusiness = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: SHOP.name,
  url: SHOP.url,
  image: `${SHOP.url}/images/cafe-bar.webp`,
  logo: `${SHOP.url}/icon.png`,
  email: SHOP.email,
  telephone: SHOP.phone,
  priceRange: "£",
  servesCuisine: ["Coffee", "Matcha"],
  address: { "@type": "PostalAddress", streetAddress: SHOP.address.line1, addressLocality: SHOP.address.town, postalCode: SHOP.address.postcode, addressCountry: "GB" },
  hasMap: SHOP.mapsUrl,
  openingHours: HOURS.map((h) => `${h.days.map((d) => DAY[d]).join(",")} ${h.open}-${h.close}`),
  sameAs: [SHOP.instagram, SHOP.tiktok],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
        <CartProvider>
          <a className="sr-only" href="#main">Skip to content</a>
          <div className="announce"><div className="wrap">Free UK delivery on coffee over £35. Christmas gifts are in: <a href="/gifts">gift subscriptions and gift cards</a>.</div></div>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
