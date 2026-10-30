// Coffee bags. Prices in pence, from the live Shopify store on 30 Oct 2026.
// Fields flagged originDraft / processDraft are unconfirmed and stay off the live pages until confirmed.
// "Isaac's House Blend" is the confirmed name. The current bag artwork still says "Dark Velvet Blend".

export const SIZES = ["250g", "500g", "1kg"] as const;
export const GRINDS = ["Whole Bean", "Filter", "Espresso"] as const;
export type Size = (typeof SIZES)[number];
export type Grind = (typeof GRINDS)[number];

export type Photo = { src: string; alt: string };

export type Product = {
  slug: string;
  name: string;
  notes: string;
  blurb: string;
  prices: Record<Size, number>;
  roast: number; // out of 5, read from the bag label
  roastLabel: string;
  origin: string;
  originDraft?: boolean;
  process: string;
  processDraft?: boolean;
  best: string;
  photos: Photo[];
  photosToShoot: string[];
  inStock: boolean;
};

const BLEND_PRICES = { "250g": 1250, "500g": 2400, "1kg": 3700 };

export const PRODUCTS: Product[] = [
  {
    slug: "house-blend",
    name: "Isaac's House Blend",
    notes: "Caramel, dark chocolate",
    blurb:
      "A rich espresso blend with smooth notes of dark chocolate and caramel. Extremely balanced, with low acidity. The coffee we pour every day in the café.",
    prices: BLEND_PRICES,
    roast: 4,
    roastLabel: "Medium to dark",
    origin: "Brazil and Colombia",
    originDraft: true,
    process: "Natural and washed",
    processDraft: true,
    best: "Espresso, milk drinks, cafetière",
    photos: [
      { src: "/images/house-blend-label.webp", alt: "Isaac's House Blend 250g bag label: caramel and dark chocolate, roast level 4 of 5" },
      { src: "/images/house-blend-bag.webp", alt: "Black Isaac's Coffee bag of House Blend standing on coffee beans in the café" },
    ],
    photosToShoot: ["Bag on the café counter", "Flat white made with this blend"],
    inStock: true,
  },
  {
    slug: "brazilian-bold-decaf",
    name: "Brazilian Bold Decaf",
    notes: "Dark chocolate",
    blurb:
      "Bold and smooth, with notes of dark chocolate. Decaffeinated by the chemical-free Swiss Water process, so you get a full cup any time of day.",
    prices: { "250g": 1500, "500g": 2800, "1kg": 4100 },
    roast: 4,
    roastLabel: "Medium to dark",
    origin: "Brazil",
    process: "Swiss Water decaf",
    best: "Espresso, cafetière, evening cups",
    photos: [
      { src: "/images/decaf-label.webp", alt: "Brazilian Bold Decaf 250g bag label: dark chocolate, Swiss Water decaf, roast level 4 of 5" },
      { src: "/images/decaf-bag.webp", alt: "Black Isaac's Coffee bag of Brazilian Bold Decaf standing on coffee beans in the café" },
    ],
    photosToShoot: ["Beans close up", "Cafetière brew at home"],
    inStock: true,
  },
  {
    slug: "blue-mountain-harmony",
    name: "Blue Mountain Harmony",
    notes: "Honey, plum",
    blurb:
      "A blend of Brazil and El Salvador put together to echo the famous Jamaica Blue Mountain beans. Light, sweet and clean.",
    prices: BLEND_PRICES,
    roast: 2,
    roastLabel: "Light to medium",
    origin: "Brazil and El Salvador",
    process: "Washed",
    processDraft: true,
    best: "Filter, V60, AeroPress",
    photos: [
      { src: "/images/blue-mountain-label.webp", alt: "Blue Mountain Harmony 250g bag label: honey and plum, roast level 2 of 5" },
    ],
    photosToShoot: ["Bag on the café counter", "Pour-over in progress", "Beans close up"],
    inStock: true,
  },
  {
    slug: "south-american-fusion",
    name: "South American Fusion",
    notes: "Pecan, toffee, milk chocolate",
    blurb:
      "A medium-bodied espresso with soft acidity, built from Guatemalan and Brazilian beans. Works as a straight shot and in milk.",
    prices: BLEND_PRICES,
    roast: 3.5,
    roastLabel: "Medium",
    origin: "Guatemala and Brazil",
    process: "Washed and natural",
    processDraft: true,
    best: "Espresso, moka pot, cafetière",
    photos: [
      { src: "/images/south-american-label.webp", alt: "South American Fusion 250g bag label: pecan, toffee and milk chocolate, roast level 3.5 of 5" },
    ],
    photosToShoot: ["Bag on the café counter", "Espresso shot pulling", "Beans close up"],
    inStock: true,
  },
];

export const getProduct = (slug: string) => PRODUCTS.find((p) => p.slug === slug);

export const BREW_GUIDE: { method: string; recipe: [string, string][]; tip: string }[] = [
  {
    method: "Espresso",
    recipe: [["18g", "Coffee in"], ["36g", "Liquid out"], ["28 to 32s", "Shot time"], ["93°C", "Water"]],
    tip: "Choose the Espresso grind. Pull a 1:2 ratio, then grind finer if the shot runs fast and sour, coarser if slow and bitter.",
  },
  {
    method: "V60 / Filter",
    recipe: [["15g", "Coffee"], ["250g", "Water"], ["3 min", "Total time"], ["94°C", "Water"]],
    tip: "Choose the Filter grind. Bloom with 40g water for 30 seconds, then pour in slow circles to 250g. Aim to finish draining by 3 minutes.",
  },
  {
    method: "Cafetière",
    recipe: [["30g", "Coffee"], ["500ml", "Water"], ["4 min", "Steep"], ["Just off boil", "Water"]],
    tip: "Choose Whole Bean and grind coarse at home. Stir after 1 minute, steep 4 minutes, skim the crust, then plunge slowly.",
  },
];
