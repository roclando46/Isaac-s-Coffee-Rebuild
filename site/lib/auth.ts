import { cookies } from "next/headers";
import { timingSafeEqual } from "node:crypto";
import { makeToken, readToken } from "@/lib/tokens";

export const ADMIN_COOKIE = "ic_admin";

export function passwordMatches(given: string) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(real);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const adminToken = () => makeToken("admin", "owner", 14);

export async function isAdmin() {
  const jar = await cookies();
  return readToken("admin", jar.get(ADMIN_COOKIE)?.value) === "owner";
}
