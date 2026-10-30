// Page check: every public page at desktop and phone width, no console errors, no sideways scroll.
// Run against a running site: BASE=http://localhost:3000 node scripts/smoke.mjs
import { createRequire } from "node:module";

// Uses the Playwright install on the machine (npx playwright install chromium if missing).
const { chromium } = createRequire(import.meta.url)("playwright");

const BASE = process.env.BASE ?? "http://localhost:3000";
const PAGES = ["/", "/shop", "/coffee/house-blend", "/coffee/south-american-fusion", "/subscribe", "/gifts", "/order-ahead",
  "/shipping", "/contact", "/account", "/privacy", "/refunds", "/terms", "/thanks", "/signed-up?status=ok", "/admin/login", "/nope"];
const SHOTS = process.env.SHOTS;

const browser = await chromium.launch();
const problems = [];
for (const [w, h] of [[1280, 900], [400, 860]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  page.on("pageerror", (e) => problems.push(`${w} ${page.url()} ${e.message}`));
  page.on("console", (m) => m.type() === "error" && !m.text().includes("google.com") && !page.url().endsWith("/nope") && problems.push(`${w} ${page.url()} console: ${m.text()}`));
  for (const p of PAGES) {
    const res = await page.goto(BASE + p, { waitUntil: "networkidle" });
    if (!res || (res.status() >= 400 && p !== "/nope")) problems.push(`${w} ${p} HTTP ${res?.status()}`);
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) problems.push(`${w} ${p} scrolls sideways`);
    const noAlt = await page.evaluate(() => [...document.images].filter((i) => !i.hasAttribute("alt")).length);
    if (noAlt) problems.push(`${w} ${p} ${noAlt} images without alt`);
    if (SHOTS) await page.screenshot({ path: `${SHOTS}/${w}${p.replace(/[/?=]/g, "_") || "_home"}.png` });
  }
  await page.close();
}
// Redirects from the old Shopify site
const page = await browser.newPage();
for (const [from, to] of [["/products/isaacs-dark-velvet-blend", "/coffee/house-blend"], ["/pages/subscribe?utm_source=instore", "/subscribe"], ["/collections/frontpage", "/shop"], ["/policies/refund-policy", "/refunds"]]) {
  await page.goto(BASE + from);
  if (new URL(page.url()).pathname !== to) problems.push(`redirect ${from} went to ${page.url()}`);
}
await browser.close();
console.log(problems.length ? problems.join("\n") : "All pages OK");
process.exit(problems.length ? 1 : 0);
