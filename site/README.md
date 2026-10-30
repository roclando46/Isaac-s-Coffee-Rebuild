# Isaac's Coffee website

The new isaacscoffee.co.uk, built to replace the Shopify store. It sells coffee bags (one-off and subscription), gift cards, gift subscriptions and order-ahead café drinks, and gives the café an admin area for packing orders.

The look follows the live Shopify theme: black and white, Ovo headings, Instrument Sans text. The design reference is `index.html` on the `main` branch.

## What runs where

| Job | Service |
| --- | --- |
| Website and API | Next.js on Vercel |
| Payments, subscriptions, receipts, customer self-service | Stripe (Checkout, Billing, Customer Portal) |
| Orders, parcels, gift cards, reviews, email list | Postgres on Neon (through Vercel) |
| Emails | Resend |
| Daily jobs (gift card delivery, reorder reminders, review requests) | Vercel Cron, 8am UTC |

## Pages

Customers: `/`, `/shop`, `/coffee/[blend]`, `/subscribe`, `/gifts`, `/order-ahead`, `/shipping`, `/contact`, `/account`, `/privacy`, `/terms`, `/refunds`.

Café staff: `/admin` (parcels to pack today), `/admin/drinks` (live drinks queue, refreshes every 15 seconds), `/admin/reviews`, `/admin/gift-cards`. Sign in with `ADMIN_PASSWORD`.

## How orders flow

1. The cart is priced by `lib/cart.ts`. The server re-prices it with the same code before sending it to Stripe Checkout, so the customer pays what the cart showed.
2. Stripe sends `checkout.session.completed` to `/api/stripe/webhook`. `lib/orders/fulfil.ts` saves the order, adds a parcel to the packing list, creates gift cards and gift subscription boxes, and sends emails.
3. Each subscription renewal (`invoice.paid`) adds the next box to the packing list.
4. Staff pack from `/admin`, type the tracking number, and the customer gets a dispatch email. `Download Click and Drop CSV` exports the day's parcels for Royal Mail.
5. The daily job sends scheduled gift cards, a reorder reminder 12 days after a one-off order, and a review request 7 days after a parcel is posted.

## Setting up (one time)

You need accounts with Stripe, Vercel and Resend, and access to the isaacscoffee.co.uk domain settings.

1. **Vercel**: import this GitHub repo. Set Root Directory to `site`. Use the Pro plan: Vercel's Hobby plan is for non-commercial use.
2. **Database**: in Vercel, Storage, create a Neon Postgres database and connect it to the project. This adds `DATABASE_URL`. Then create the tables from your computer:
   ```bash
   cd site && npm install && DATABASE_URL="<from Vercel>" npx drizzle-kit migrate
   ```
3. **Stripe**: in test mode, copy the secret key. Add a webhook endpoint `https://<your-vercel-url>/api/stripe/webhook` with events `checkout.session.completed`, `checkout.session.async_payment_succeeded` and `invoice.paid`, and copy its signing secret. Then run:
   ```bash
   cd site && STRIPE_SECRET_KEY=sk_test_... npm run setup:stripe
   ```
   This creates the WELCOME10 code and the subscription self-service portal.
4. **Resend**: add and verify the domain isaacscoffee.co.uk (it gives you DNS records to add). Create an API key.
5. **Environment variables**: add everything in `.env.example` under Vercel, Settings, Environment Variables. Generate `APP_SECRET` and `CRON_SECRET` with `openssl rand -hex 32`.
6. Redeploy, then test with Stripe's test card `4242 4242 4242 4242`, any future date and any CVC.

## Facts to confirm before launch

Confirmed on 30 October 2026: opening hours, business email, phone number and shipping prices. The phone number is listed as 020 0000 0000, which reads like a placeholder, so check it.

Still drafts in `content/settings.ts` and `content/products.ts`:

- Posting days and same-day dispatch cut-off (`DISPATCH_CUTOFF`, hidden until set)
- Gift subscription prices (3 months £45, 6 months £89, delivery included)
- Christmas last order dates (check Royal Mail's 2026 dates)
- House Blend origin, and the process for House Blend, Blue Mountain Harmony and South American Fusion. Unconfirmed values stay off the bag pages (`originDraft`, `processDraft`).
- Roast day
- New House Blend bag artwork: the label photo still says "Dark Velvet Blend"
- Two more photos per bag (`photosToShoot` lists suggested shots)
- Privacy, terms and refund pages: have them checked, and add the company name and number if the business is a limited company

To play the café video on the home page, add it as `public/hero.mp4` and set `HERO_VIDEO` in `content/settings.ts`.

## Launch checklist

1. Place a test order for each flow on the Vercel preview: one-off bag, subscription, click and collect, gift card, gift subscription, drinks, WELCOME10, a gift card code.
2. Export Shopify customers who accepted email marketing (Shopify admin, Customers, Export) and add them to the `subscribers` table with `source = 'import'`, `status = 'active'`.
3. Switch Stripe to live mode: run `npm run setup:stripe` with the live key, create the live webhook, and update the Stripe variables in Vercel.
4. In Vercel, Domains, add isaacscoffee.co.uk and update the DNS records it shows. Shopify stops serving the site once DNS points to Vercel.
5. Check a few old addresses redirect: `/products/isaacs-dark-velvet-blend`, `/pages/subscribe`, `/collections/frontpage`. Printed QR codes point at `/pages/subscribe` and keep working.
6. Submit `https://isaacscoffee.co.uk/sitemap.xml` in Google Search Console.
7. Keep Shopify open for 30 days to refund any old orders, then cancel the plan.

## Working on the code

```bash
cd site
npm install
cp .env.example .env.local   # fill in test keys
npm run dev                  # http://localhost:3000
npm test                     # pricing, delivery, gift cards, drinks, tokens, webhook fulfilment
npm run lint                 # type check
npm run build
npm run check:pages          # with the site running: every page at desktop and phone width
```

Without keys the shop pages work and checkout shows an "unavailable" message. Without `RESEND_API_KEY`, emails are logged instead of sent.

## Known limits

- Customers manage subscriptions in Stripe's portal: change card, update address, see receipts, cancel. Skipping a single box isn't offered; they email the café, and staff pause collection in the Stripe dashboard.
- One order can hold one subscription rhythm (every 2 or every 4 weeks). The bag page warns before a clash.
- A subscription box under £35 pays its own delivery each time, including on the first order. A first order that mixes a small subscription with one-off bags over £35 still pays that subscription's delivery. The cart shows the charge before checkout.
- A gift card code is checked when checkout opens and charged when payment completes. Two people spending the same card at the same moment could overdraw it by one order.
- Drinks ordering has no sold-out switch. To pause it, set every day's hours in `HOURS` to closed, or remove a drink from `content/drinks.ts`.
