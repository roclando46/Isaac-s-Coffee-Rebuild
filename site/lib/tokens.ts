// Signed, expiring tokens for links in emails and the admin cookie. HMAC-SHA256 with APP_SECRET.
import { createHmac, timingSafeEqual } from "node:crypto";

const secret = () => {
  const s = process.env.APP_SECRET;
  if (!s || s.length < 32) throw new Error("APP_SECRET must be set to at least 32 characters");
  return s;
};

const sign = (body: string) => createHmac("sha256", secret()).update(body).digest("base64url");

export function makeToken(purpose: string, subject: string, ttlDays: number): string {
  const exp = Math.floor(Date.now() / 1000) + ttlDays * 86400;
  const body = Buffer.from(JSON.stringify({ p: purpose, s: subject, e: exp })).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Returns the subject if the token is genuine, unexpired and for this purpose, otherwise null. */
export function readToken(purpose: string, token: string | undefined | null): string | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const { p, s, e } = JSON.parse(Buffer.from(body, "base64url").toString());
    if (p !== purpose || typeof s !== "string" || e < Date.now() / 1000) return null;
    return s;
  } catch {
    return null;
  }
}
