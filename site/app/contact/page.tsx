import type { Metadata } from "next";
import { HOURS, SHOP } from "@/content/settings";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = { title: "Contact and Opening Hours", description: "Find Isaac's Coffee at Lower Ground, 120 St Margarets Road, Twickenham TW1 2AA, opposite St Margarets station. Opening hours, phone and email." };

const time = (hhmm: string) => { const [h, m] = hhmm.split(":").map(Number); return `${h % 12 || 12}${m ? `:${String(m).padStart(2, "0")}` : ""}${h < 12 ? "am" : "pm"}`; };

export default function Contact() {
  return (
    <>
      <div className="wrap page-head"><p className="eyebrow">Contact</p><h1>Visit, call or write to us</h1><p>We&apos;re in the basement café right opposite St Margarets station.</p></div>
      <div className="wrap contact-grid">
        <dl className="info">
          <div><dt>Address</dt><dd>Isaac&apos;s Coffee<br />{SHOP.address.line1}<br />{SHOP.address.town} {SHOP.address.postcode}</dd></div>
          <div><dt>Opening hours</dt><dd className="hours">{HOURS.map((h) => <span key={h.label} style={{ display: "contents" }}><span>{h.label}</span><span>{time(h.open)} to {time(h.close)}</span></span>)}</dd></div>
          <div><dt>Email</dt><dd><a href={`mailto:${SHOP.email}`}>{SHOP.email}</a></dd></div>
          <div><dt>Phone</dt><dd><a href={`tel:${SHOP.phone.replace(/\s/g, "")}`}>{SHOP.phone}</a></dd></div>
          <div><dt>Getting here</dt><dd>1 minute from St Margarets station (South Western Railway).</dd></div>
        </dl>
        <div style={{ display: "grid", gap: "1.5rem", minWidth: 0 }}>
          <iframe src={SHOP.mapsEmbed} title="Map to Isaac's Coffee" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0, width: "100%", aspectRatio: "16/10", filter: "grayscale(1) invert(.9)" }} />
          <ContactForm />
        </div>
      </div>
    </>
  );
}
