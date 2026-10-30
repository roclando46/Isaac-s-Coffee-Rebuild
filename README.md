# Isaac's Coffee rebuild

A clickable preview of isaacscoffee.co.uk with nine fixes. It keeps the live theme's black and white palette, Ovo headings and Instrument Sans body text.

Open `index.html` in a browser. Pages: Home, Shop, four bag pages, Subscribe, Pickup, Shipping, Contact, What changed, Launch checklist and In-store QR.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The full preview in one file. Images are embedded. |
| `qr/isaacs-subscribe-qr.png`, `.svg` | QR code for table cards and cups. Links to `isaacscoffee.co.uk/pages/subscribe?utm_source=instore&utm_medium=qr&utm_campaign=table`. |
| `src/template.html` | Page source with `{{logo}}`, `{{qr}}` and `{{IMGS}}` placeholders. |
| `src/assets.json` | Product photos, logo and QR as data URIs. |
| `src/build.py` | Rebuilds `index.html`: `python3 src/build.py` |

## The nine fixes

| # | Fix | Status |
| --- | --- | --- |
| 1 | Shipping policy and rates, free delivery over £35 | In preview |
| 2 | Address, hours, phone, email and map on Contact and footer | In preview |
| 3 | Working email sign-up, single price and name, stock status per variant | In preview, plus a Shopify setting |
| 4 | Meta description | In preview, set in Shopify Preferences |
| 5 | Subscriptions, 10% off every 2 or 4 weeks, subscribe as default | Needs Shopify Subscriptions app |
| 6 | Welcome email with WELCOME10, reorder reminder after 12 days | Needs Shopify Email |
| 7 | Reviews, request 7 days after delivery | Needs Judge.me |
| 8 | Origin, roast level, roast day, brew guide, 2 more photos per bag | In preview, photos to shoot |
| 9 | QR code on tables and cups linking to subscribe | In preview, files in `qr/` |

The Launch checklist page in the preview lists the Shopify admin steps and the email copy.

## Confirmed shop details

- Opening hours: Monday to Friday 7:30am to 4pm, Saturday 8am to 4pm, Sunday 9am to 3pm
- Phone: 020 0000 0000
- Business email: hello@isaacscoffee.co.uk
- Shipping: Tracked 48 £3.95 under £35 and free at £35 or over; Tracked 24 £4.95 under £35 and £1.95 at £35 or over; click and collect free

## Draft copy to confirm

Text with a dotted underline in the preview is a placeholder:

- Posting schedule and dispatch cutoff (Monday to Friday and 12pm were suggested; neither is confirmed)
- House Blend origin
- Process for House Blend, Blue Mountain Harmony and South American Fusion
- Roast day

## Notes

- Address source: Food Standards Agency listing, Lower Ground, 120 St Margarets Road, Twickenham TW1 2AA.
- Roast levels come from the bag labels: Blue Mountain 2/5, South American Fusion 3.5/5, House Blend 4/5, Decaf 4/5.
- The "!20" typo was not found on the home, contact, collection or product pages.
- The confirmed product name and preview route are “Isaac's House Blend” and `isaacs-house-blend`. Current House Blend bag artwork still says “Dark Velvet Blend” and is marked for replacement before launch.
