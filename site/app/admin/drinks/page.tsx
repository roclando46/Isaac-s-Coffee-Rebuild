import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import AdminNav from "../AdminNav";
import DrinksBoard from "./DrinksBoard";

export const metadata: Metadata = { title: "Drinks orders", robots: { index: false } };

export default async function Drinks() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="wrap admin">
      <AdminNav current="/admin/drinks" />
      <h1>Drinks to make</h1>
      <DrinksBoard />
    </div>
  );
}
