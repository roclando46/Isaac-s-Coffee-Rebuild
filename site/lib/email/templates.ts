// Email copy. Each builder returns subject, HTML and plain text.
import { SHOP, WELCOME_CODE } from "@/content/settings";
import { gbp } from "@/lib/cart";
import { siteUrl } from "@/lib/stripe";
import { makeToken } from "@/lib/tokens";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

type Block = { p?: string; button?: [string, string]; code?: string; list?: string[] };

function layout(heading: string, blocks: Block[], footerLinks: [string, string][] = []) {
  const body = blocks.map((b) => {
    if (b.p) return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6">${esc(b.p)}</p>`;
    if (b.code) return `<p style="margin:0 0 16px;font-size:22px;letter-spacing:2px;font-weight:700;padding:14px 18px;border:2px solid #000000;display:inline-block">${esc(b.code)}</p>`;
    if (b.button) return `<p style="margin:8px 0 20px"><a href="${b.button[1]}" style="background:#000000;color:#FFFFFF;padding:14px 22px;text-decoration:none;font-weight:600;border-radius:4px;display:inline-block">${esc(b.button[0])}</a></p>`;
    if (b.list) return `<ul style="margin:0 0 16px;padding-left:20px;font-size:15px;line-height:1.6">${b.list.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
    return "";
  }).join("");
  const links = footerLinks.map(([t, u]) => `<a href="${u}" style="color:#555555">${esc(t)}</a>`).join(" · ");
  const html = `<!doctype html><html><body style="margin:0;background:#FFFFFF;font-family:Helvetica,Arial,sans-serif;color:#000000">
<div style="background:#000000;color:#FFFFFF;padding:22px 24px;text-align:center;font-family:Georgia,serif;font-size:22px;letter-spacing:2px">ISAAC'S COFFEE</div>
<div style="max-width:560px;margin:0 auto;padding:28px 24px">
<h1 style="font-family:Georgia,serif;font-weight:400;font-size:26px;margin:0 0 18px">${esc(heading)}</h1>${body}
<p style="margin:28px 0 0;font-size:13px;color:#555555;line-height:1.6">Isaac's Coffee, ${esc(SHOP.address.line1)}, ${esc(SHOP.address.town)} ${esc(SHOP.address.postcode)}${links ? `<br>${links}` : ""}</p>
</div></body></html>`;
  const textBlocks = blocks.flatMap((b) =>
    b.p ? [b.p] : b.code ? [b.code] : b.button ? [`${b.button[0]}: ${b.button[1]}`] : (b.list ?? []).map((l) => `- ${l}`),
  );
  const text = [heading, "", ...textBlocks, "", `Isaac's Coffee, ${SHOP.address.line1}, ${SHOP.address.town} ${SHOP.address.postcode}`,
    ...footerLinks.map(([t, u]) => `${t}: ${u}`)].join("\n");
  return { html, text };
}

const marketingFooter = (email: string): [string, string][] => [
  ["Unsubscribe", `${siteUrl()}/unsubscribe?t=${makeToken("unsub", email, 365)}`],
];
const serviceFooter = (email: string): [string, string][] => [
  ["Stop reminder and review emails", `${siteUrl()}/unsubscribe?t=${makeToken("optout", email, 365)}`],
];

export function confirmSignup(email: string) {
  const url = `${siteUrl()}/api/signup/confirm?t=${makeToken("signup", email, 7)}`;
  return { subject: "Confirm your email for Isaac's Coffee", ...layout("One click to join", [
    { p: "Confirm your email and we'll send your 10% welcome code straight away." },
    { button: ["Confirm my email", url] },
    { p: "Didn't sign up? Ignore this email and you won't hear from us." },
  ]) };
}

export function welcome(email: string) {
  return { subject: "Welcome to Isaac's. Here's 10% off.", ...layout("Welcome to Isaac's Coffee", [
    { p: "Thanks for joining. Here's 10% off your first order of beans:" },
    { code: WELCOME_CODE },
    { p: "Not sure where to start? Our House Blend is the coffee we pour in the café every day: caramel, dark chocolate, low acidity. Great in milk." },
    { button: ["Shop coffee", `${siteUrl()}/shop`] },
    { p: "Free UK delivery on coffee over £35, or collect free from the café opposite St Margarets station." },
  ], marketingFooter(email)) };
}

export type ReceiptLine = { title: string; detail: string; amount: number };

export function orderConfirmation(o: { email: string; number: number; lines: ReceiptLine[]; total: number; discount: number; delivery: string; collect: boolean }) {
  return { subject: `Order ${o.number} confirmed`, ...layout(`Thanks, order ${o.number} is in`, [
    { list: o.lines.map((l) => `${l.title} (${l.detail}): ${gbp(l.amount)}`) },
    ...(o.discount ? [{ p: `Discount: −${gbp(o.discount)}` }] : []),
    { p: `Total paid: ${gbp(o.total)}` },
    { p: o.collect ? "We'll email you when your order is ready to collect from the café." : `Delivery: ${o.delivery}. We'll email your tracking number when it ships.` },
    { p: "Questions? Reply to this email." },
  ]) };
}

export function dispatched(s: { email: string; tracking: string | null; collect: boolean }) {
  return s.collect
    ? { subject: "Your order is ready to collect", ...layout("Ready to collect", [
        { p: `Your coffee is waiting at ${SHOP.address.line1}, ${SHOP.landmark.toLowerCase()}. Bring your order email. We hold orders for 14 days.` },
      ]) }
    : { subject: "Your coffee is on its way", ...layout("On its way", [
        { p: "Your coffee has left the café." },
        ...(s.tracking ? [{ p: `Royal Mail tracking number: ${s.tracking}` }, { button: ["Track parcel", `https://www.royalmail.com/track-your-item#/tracking-results/${encodeURIComponent(s.tracking)}`] as [string, string] }] : []),
      ]) };
}

export function giftCardDelivery(g: { recipientEmail: string; recipientName?: string | null; code: string; amount: number; message?: string | null; from: string }) {
  return { subject: `You've been sent a ${gbp(g.amount)} Isaac's Coffee gift card`, ...layout(`${g.recipientName ? `${g.recipientName}, a` : "A"} gift for you`, [
    { p: `${g.from} sent you a ${gbp(g.amount)} gift card for Isaac's Coffee.` },
    ...(g.message ? [{ p: `“${g.message}”` }] : []),
    { code: g.code },
    { p: "Enter this code in your cart at checkout. Any balance stays on the card for next time. It never expires." },
    { button: ["Choose your coffee", `${siteUrl()}/shop`] },
  ]) };
}

export function reorderReminder(email: string) {
  return { subject: "Running low on beans?", ...layout("Running low on beans?", [
    { p: "A 250g bag makes about 15 cups, so yours is likely close to empty." },
    { button: ["Reorder my coffee", `${siteUrl()}/shop`] },
    { p: "Or switch to a subscription: the same coffee every 2 or 4 weeks, 10% off every bag, cancel any time." },
    { button: ["Subscribe and save 10%", `${siteUrl()}/subscribe`] },
  ], serviceFooter(email)) };
}

export function reviewRequest(email: string, products: { slug: string; name: string }[], shipmentId: string) {
  return { subject: "How's your coffee?", ...layout("How's your coffee?", [
    { p: "Your coffee arrived about a week ago. A two-line review helps other coffee lovers pick their next bag." },
    ...products.map((p) => ({ button: [`Review ${p.name}`, `${siteUrl()}/review?t=${makeToken("review", `${shipmentId}|${p.slug}|${email}`, 60)}`] as [string, string] })),
  ], serviceFooter(email)) };
}

export function portalLink(email: string, url: string) {
  return { subject: "Manage your Isaac's Coffee subscription", ...layout("Manage your subscription", [
    { p: "Use the button below to change your card, see receipts or cancel. The link works for 1 hour." },
    { button: ["Open my account", url] },
    { p: "Didn't ask for this? Ignore this email." },
  ]) };
}

export function drinksOrderForCafe(o: { number: number; name: string; pickup: string; lines: string[]; total: number }) {
  return { subject: `Drinks ${o.number} for ${o.name} at ${o.pickup}`, ...layout(`Collect ${o.pickup}: ${o.name}`, [
    { list: o.lines }, { p: `Paid ${gbp(o.total)}` }, { button: ["Open drinks screen", `${siteUrl()}/admin/drinks`] },
  ]) };
}

export function drinksOrderForCustomer(o: { email: string; number: number; pickup: string; lines: string[]; total: number }) {
  return { subject: `Your drinks are ordered for ${o.pickup}`, ...layout(`See you at ${o.pickup}`, [
    { list: o.lines }, { p: `Paid ${gbp(o.total)}. Order number ${o.number}.` },
    { p: `Collect from ${SHOP.address.line1}, ${SHOP.landmark.toLowerCase()}. Give your name at the counter.` },
  ]) };
}

export function contactMessage(m: { name: string; email: string; phone: string; message: string }) {
  return { subject: `Website message from ${m.name || m.email}`, ...layout("New message from the website", [
    { p: `From: ${m.name || "(no name)"} <${m.email}>` }, ...(m.phone ? [{ p: `Phone: ${m.phone}` }] : []), { p: m.message },
  ]) };
}
