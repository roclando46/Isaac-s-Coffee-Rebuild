"use client";
import { useState } from "react";
import { isEmail, useSubmit } from "./useSubmit";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const { submit, result, setResult, pending } = useSubmit("/api/signup");
  return (
    <>
      <form className="signup" noValidate onSubmit={async (e) => {
        e.preventDefault();
        if (!isEmail(email)) return setResult({ ok: false, message: "Enter an email like name@example.com." });
        const r = await submit({ email });
        if (r?.ok) setEmail("");
      }}>
        <input id="footEmail" type="email" placeholder="Your email" autoComplete="email" aria-label="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" disabled={pending}>{pending ? "…" : "Sign up"}</button>
      </form>
      {result && <p className={`msg ${result.ok ? "ok" : "err"}`} role="status">{result.message}</p>}
    </>
  );
}
