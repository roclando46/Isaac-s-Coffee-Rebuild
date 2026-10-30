import { NextResponse } from "next/server";
import { pickupSlots } from "@/lib/drinks";

export const dynamic = "force-dynamic";
export const GET = () => NextResponse.json({ slots: pickupSlots(new Date()) });
