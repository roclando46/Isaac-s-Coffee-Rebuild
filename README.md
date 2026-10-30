# Isaac's Coffee rebuild

A clickable preview of isaacscoffee.co.uk with twelve fixes. It keeps the live theme's black and white palette, Ovo headings and Instrument Sans body text.

The full replacement website (Next.js, Stripe, Postgres) is in the `site/` folder. See `site/README.md`.

Open `index.html` in a browser. Pages: Home, Shop, four bag pages, Subscribe, Gifts, Pickup, Shipping, Contact, What changed, Launch checklist and In-store QR.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The full preview in one file. Images are embedded. |
| `qr/isaacs-subscribe-qr.png`, `.svg` | QR code for table cards and cups. Links to `isaacscoffee.co.uk/pages/subscribe?utm_source=instore&utm_medium=qr&utm_campaign=table`. |
| `src/template.html` | Page source with `{{logo}}`, `{{qr}}` and `{{IMGS}}` placeholders. |
| `src/assets.json` | Product photos (WebP), logo and QR as data URIs. |
| `src/build.py` | Rebuilds `index.html`: `python3 src/build.py` |

## The fixes

| # | Fix | Status |
| --- | --- | --- |
| 1 | Shipping policy and rates, free delivery over £35 | In preview |
| 2 | Address, hours, phone, email and map on Contact and footer | In preview |
| 3 | Working email sign-up, single price and name, stock status per variant | In preview, plus a Shopify setting |
| 4 | Meta description | In preview, set in Shopify Preferences |
| 5 | Subscriptions, 10% off every 2 or 4 weeks, subscribe as default | Needs Shopify Subscriptions app |
| 6 | Welcome email with WELCOME10, reorder reminder after 12 days | Needs Shopify Email |
| 7 | Reviews, request 7 days after delivery | Needs Judge.me |
| 8 | Origin, roast level, roast date, brew guide, 2 more photos per bag | In preview, photos to shoot |
| 9 | QR code on tables and cups linking to subscribe | In preview, files in `qr/` |
| 10 | Christmas gifting: gift subscriptions, gift cards, gift messages, last order dates | In preview, needs gift card setup and a prepaid plan |
| 11 | Home hero headline and buttons, November banner | In preview, set in the theme editor |
| 12 | SEO: alt text, local business schema, page titles, Google Business Profile | In preview, paste into Shopify |

The Launch checklist page in the preview lists the Shopify admin steps and the email copy.

## Draft copy to confirm

Text with a dotted underline in the preview is a placeholder:

- Opening hours
- Phone number
- Business email (hello@isaacscoffee.co.uk suggested)
- Shipping rates: Tracked 48 £3.95, Tracked 24 £4.95 (£1.95 over £35), 12pm dispatch cut-off
- House Blend origin
- Process for House Blend, Blue Mountain Harmony and South American Fusion
- Roast day
- Gift subscription prices: 3 months £45, 6 months £89, delivery included
- Christmas last order dates (check against Royal Mail's 2026 dates)

## Alt text to paste into Shopify

| Photo | Alt text |
| --- | --- |
| House Blend label | Isaac's House Blend 250g bag label: caramel and dark chocolate, roast level 4 of 5 |
| House Blend bag photo | Black Isaac's Coffee bag of House Blend standing on coffee beans in the café |
| Decaf label | Brazilian Bold Decaf 250g bag label: dark chocolate, Swiss Water decaf, roast level 4 of 5 |
| Decaf bag photo | Black Isaac's Coffee bag of Brazilian Bold Decaf standing on coffee beans in the café |
| Blue Mountain Harmony label | Blue Mountain Harmony 250g bag label: honey and plum, roast level 2 of 5 |
| South American Fusion label | South American Fusion 250g bag label: pecan, toffee and milk chocolate, roast level 3.5 of 5 |
| Café photo | Baristas making coffee behind the bar at Isaac's Coffee, St Margarets |
| Iced Matcha | Iced matcha latte in a clear takeaway cup at Isaac's Coffee |
| Hot Coffee | Latte art in an Isaac's Coffee takeaway cup |
| Matcha Latte | Hot matcha latte with latte art at Isaac's Coffee |

## Notes

- Address source: Food Standards Agency listing, Lower Ground, 120 St Margarets Road, Twickenham TW1 2AA.
- Roast levels come from the bag labels: Blue Mountain 2/5, South American Fusion 3.5/5, House Blend 4/5, Decaf 4/5.
- Shopify already serves product photos as WebP to modern browsers (about 35KB for a bag label), so the live images need no work.
- The "!20" typo was not found on the home, contact, collection or product pages.
- The House Blend has three names: "Dark Velvet Blend" on the bag, "Isaac's House Blend" in the shop, and `isaacs-dark-velvet-blend` in the URL.
