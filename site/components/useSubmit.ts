"use client";
import { useState } from "react";

export type Result = { ok: boolean; message: string } | null;

/** Posts JSON to an API route and keeps the message to show under the form. */
export function useSubmit(url: string) {
  const [result, setResult] = useState<Result>(null);
  const [pending, setPending] = useState(false);
  async function submit(body: unknown): Promise<Result> {
    setPending(true);
    try {
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      const r = { ok: Boolean(data.ok ?? res.ok), message: data.message ?? data.error ?? (res.ok ? "Done." : "Something went wrong. Try again in a minute.") };
      setResult(r);
      return { ...r, ...data };
    } catch {
      const r = { ok: false, message: "No connection. Check your internet and try again." };
      setResult(r);
      return r;
    } finally {
      setPending(false);
    }
  }
  return { submit, result, setResult, pending };
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
