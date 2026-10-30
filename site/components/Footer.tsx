import Link from "next/link";
import { HOURS, SHOP } from "@/content/settings";
import SignupForm from "./SignupForm";

const time = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""}${h < 12 ? "am" : "pm"}`;
};

export default function Footer() {
  return (
    <footer className="site"><div className="wrap">
      <div className="fgrid">
        <div>
          <h4>Visit the café</h4>
          <ul>
            <li>{SHOP.address.line1}<br />{SHOP.address.town} {SHOP.address.postcode}</li>
            <li>{SHOP.landmark}</li>
            <li><a href={SHOP.mapsUrl} target="_blank" rel="noopener">Open in Google Maps</a></li>
          </ul>
        </div>
        <div>
          <h4>Opening hours</h4>
          <ul>{HOURS.map((h) => <li key={h.label}>{h.label} {time(h.open)} to {time(h.close)}</li>)}</ul>
        </div>
        <div>
          <h4>Get in touch</h4>
          <ul>
            <li><a href={`mailto:${SHOP.email}`}>{SHOP.email}</a></li>
            <li><a href={`tel:${SHOP.phone.replace(/\s/g, "")}`}>{SHOP.phone}</a></li>
            <li><Link href="/contact">Contact form</Link></li>
            <li><a href={SHOP.instagram} target="_blank" rel="noopener">Instagram</a> · <a href={SHOP.tiktok} target="_blank" rel="noopener">TikTok</a></li>
          </ul>
        </div>
        <div>
          <h4>10% off your first order</h4>
          <p style={{ fontSize: ".92rem" }}>Join the list for new roasts and your welcome code.</p>
          <SignupForm />
        </div>
      </div>
      <div className="fbase">
        <span>© {new Date().getFullYear()} Isaac&apos;s Coffee, St Margarets</span>
        <span><Link href="/shipping">Shipping</Link> · <Link href="/refunds">Refunds</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · <Link href="/account">My subscription</Link></span>
      </div>
    </div></footer>
  );
}
