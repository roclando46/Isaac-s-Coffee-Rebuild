"use client";
import { useActionState } from "react";
import { login } from "../actions";

export default function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="stack" style={{ maxWidth: 360, marginTop: "1.5rem" }}>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <button className="btn" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      {error && <p className="msg err" role="alert">{error}</p>}
    </form>
  );
}
