"use client";
import { useState } from "react";
import { isEmail, useSubmit } from "./useSubmit";

export default function AccountForm() {
  const [email, setEmail] = useState("");
  const { submit, result, setResult, pending } = useSubmit("/api/account");
  return (
    <form className="stack" style={{ maxWidth: 420, marginTop: "1.5rem" }} noValidate onSubmit={(e) => {
      e.preventDefault();
      if (!isEmail(email)) return setResult({ ok: false, message: "Enter the email you ordered with." });
      submit({ email });
    }}>
      <div className="field"><label htmlFor="aEmail">Email</label><input id="aEmail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div><button className="btn" disabled={pending}>{pending ? "Sending…" : "Email me a sign-in link"}</button></div>
      {result && <p className={`msg ${result.ok ? "ok" : "err"}`} role="status">{result.message}</p>}
    </form>
  );
}
