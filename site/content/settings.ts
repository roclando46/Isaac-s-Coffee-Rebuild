// Shop facts. Hours, email, phone and shipping prices were confirmed by the owner on 30 Oct 2026.
// Values still marked DRAFT need confirming before launch.

export const SHOP = {
  name: "Isaac's Coffee",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://isaacscoffee.co.uk",
  address: {
    line1: "Lower Ground, 120 St Margarets Road",
    town: "Twickenham",
    postcode: "TW1 2AA",
    country: "GB",
  },
  landmark: "Opposite St Margarets station",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Isaac%27s+Coffee+120+St+Margarets+Road+Twickenham+TW1+2AA",
  mapsEmbed:
    "https://www.google.com/maps?q=Isaac%27s+Coffee,+120+St+Margarets+Road,+Twickenham+TW1+2AA&output=embed",
  email: "hello@isaacscoffee.co.uk",
  phone: "020 0000 0000", // Confirmed as listed, but reads like a placeholder: check before launch.
  instagram: "https://www.instagram.com/",
  tiktok: "https://www.tiktok.com/",
} as const;

// Day 0 is Sunday. Times are 24h "HH:MM" in UK time.
export const HOURS: { label: string; days: number[]; open: string; close: string }[] = [
  { label: "Mon to Fri", days: [1, 2, 3, 4, 5], open: "07:30", close: "16:00" },
  { label: "Saturday", days: [6], open: "08:00", close: "16:00" },
  { label: "Sunday", days: [0], open: "09:00", close: "15:00" },
];

// All money in pence.
export const FREE_SHIPPING_THRESHOLD = 3500;
export const SUBSCRIPTION_DISCOUNT = 0.1;
export const SUBSCRIPTION_WEEKS = [2, 4] as const;

// Shipping prices. "days" are typical Royal Mail times.
export const SHIPPING = {
  tracked48: { label: "Royal Mail Tracked 48", days: "2 to 3 working days", under: 395, over: 0 },
  tracked24: { label: "Royal Mail Tracked 24", days: "1 to 2 working days", under: 495, over: 195 },
  collect: { label: "Click and collect, St Margarets", days: "Ready in 2 hours during opening times", under: 0, over: 0 },
} as const;
// DRAFT: posting days and same-day cut-off are not confirmed. Set to e.g. "12pm" to show
// "Orders placed before 12pm on a weekday leave the same day" on the shipping page.
export const DISPATCH_CUTOFF: string | null = null;

// DRAFT gift prices, delivery included.
export const GIFT_SUBSCRIPTION = {
  3: { months: 3, price: 4500, shipments: 3 },
  6: { months: 6, price: 8900, shipments: 6 },
} as const;
export const GIFT_CARD_AMOUNTS = [1500, 2500, 5000, 7500];

// DRAFT. Check against Royal Mail's published 2026 last posting dates.
export const CHRISTMAS_DATES: [string, string][] = [
  ["Royal Mail Tracked 48", "Wed 16 December, 12pm"],
  ["Royal Mail Tracked 24", "Fri 18 December, 12pm"],
  ["Gift cards by email", "Up to Christmas Day"],
  ["Click and collect, St Margarets", "Thu 24 December, during opening hours"],
];

export const WELCOME_CODE = "WELCOME10";
export const REORDER_REMINDER_DAYS = 12;
export const REVIEW_REQUEST_DAYS = 7;

// Drinks order-ahead: earliest pickup is this many minutes from now, slots every 10 minutes.
export const DRINKS_LEAD_MINUTES = 10;
export const DRINKS_SLOT_MINUTES = 10;

// Put the café video at public/hero.mp4 and set this to "/hero.mp4" to play it behind the home headline.
export const HERO_VIDEO: string | null = null;
