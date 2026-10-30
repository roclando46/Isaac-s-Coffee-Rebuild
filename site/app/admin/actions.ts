"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { ADMIN_COOKIE, adminToken, isAdmin, passwordMatches } from "@/lib/auth";
import { db, orders, reviews, shipments } from "@/lib/db";
import { sendMail } from "@/lib/email/send";
import { dispatched } from "@/lib/email/templates";

async function guard() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function login(_: string | null, form: FormData): Promise<string | null> {
  if (!passwordMatches(String(form.get("password") ?? ""))) return "That password is wrong.";
  (await cookies()).set(ADMIN_COOKIE, adminToken(), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 14 * 86400 });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

export async function markDispatched(form: FormData) {
  await guard();
  const id = String(form.get("id"));
  const tracking = String(form.get("tracking") ?? "").trim() || null;
  const [s] = await db().update(shipments).set({ status: "dispatched", trackingNumber: tracking, dispatchedAt: new Date() })
    .where(eq(shipments.id, id)).returning();
  if (s) await sendMail({ to: s.email, ...dispatched({ email: s.email, tracking, collect: s.delivery === "collect" }) });
  revalidatePath("/admin");
}

export async function setDrinkStatus(form: FormData) {
  await guard();
  const status = String(form.get("status")) as "ready" | "collected";
  await db().update(orders).set({ status }).where(eq(orders.id, String(form.get("id"))));
  revalidatePath("/admin/drinks");
}

export async function moderateReview(form: FormData) {
  await guard();
  const status = String(form.get("status")) as "approved" | "rejected";
  await db().update(reviews).set({ status }).where(eq(reviews.id, String(form.get("id"))));
  revalidatePath("/admin/reviews");
}
