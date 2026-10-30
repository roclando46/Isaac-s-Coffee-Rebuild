"use client";
import { useState } from "react";
import { isEmail, useSubmit } from "./useSubmit";

export default function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "", website: "" });
  const { submit, result, setResult, pending } = useSubmit("/api/contact");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <form className="stack" noValidate onSubmit={async (e) => {
      e.preventDefault();
      if (!isEmail(f.email)) return setResult({ ok: false, message: "Add your email so we can reply." });
      if (!f.message.trim()) return setResult({ ok: false, message: "Write a message before sending." });
      const r = await submit(f);
      if (r?.ok) setF({ name: "", email: "", phone: "", message: "", website: "" });
    }}>
      <h3>Send us a message</h3>
      <div className="two">
        <div className="field"><label htmlFor="cName">Name</label><input id="cName" autoComplete="name" value={f.name} onChange={set("name")} /></div>
        <div className="field"><label htmlFor="cEmail">Email</label><input id="cEmail" type="email" autoComplete="email" value={f.email} onChange={set("email")} /></div>
      </div>
      <div className="field"><label htmlFor="cPhone">Phone (optional)</label><input id="cPhone" type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} /></div>
      <div className="field"><label htmlFor="cMsg">Message</label><textarea id="cMsg" rows={4} value={f.message} onChange={set("message")} /></div>
      <input className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={set("website")} name="website" />
      <div><button className="btn" type="submit" disabled={pending}>{pending ? "Sending…" : "Send message"}</button></div>
      {result && <p className={`msg ${result.ok ? "ok" : "err"}`} role="status">{result.message}</p>}
    </form>
  );
}
