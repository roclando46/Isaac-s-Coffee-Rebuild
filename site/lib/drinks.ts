// Drinks order-ahead: pricing and collection slots. All money in pence.
import { z } from "zod";
import { PLANT_MILKS, PLANT_MILK_SURCHARGE, getDrink, type DrinkSize, type Milk } from "@/content/drinks";
import { DRINKS_LEAD_MINUTES, DRINKS_SLOT_MINUTES, HOURS } from "@/content/settings";

export const DrinkLine = z.object({
  id: z.string(),
  size: z.enum(["Regular", "Large"]),
  milk: z.enum(["Whole", "Semi skim", "Oat", "Coconut"]),
  qty: z.number().int().min(1).max(10),
});
export type DrinkLine = z.infer<typeof DrinkLine>;

export const DrinksRequest = z.object({
  lines: z.array(DrinkLine).min(1).max(12),
  pickup: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().trim().min(1).max(60),
});

export function drinkPrice(id: string, size: DrinkSize, milk: Milk): number {
  const d = getDrink(id);
  if (!d) throw new Error(`Unknown drink: ${id}`);
  const base = d.prices[size];
  if (base === undefined) throw new Error(`${d.name} does not come in ${size}`);
  if (!d.milks.includes(milk)) throw new Error(`${d.name} does not come with ${milk} milk`);
  return base + (PLANT_MILKS.includes(milk) ? PLANT_MILK_SURCHARGE : 0);
}

/** UK wall-clock parts for a moment in time. */
export function ukParts(now: Date) {
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const parts = Object.fromEntries(f.formatToParts(now).map((p) => [p.type, p.value]));
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  return { day, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

/** Collection slots left today, as "HH:MM" UK time. Last slot is 15 minutes before closing. */
export function pickupSlots(now: Date): string[] {
  const { day, minutes } = ukParts(now);
  const today = HOURS.find((h) => h.days.includes(day));
  if (!today) return [];
  const first = Math.max(toMin(today.open), minutes + DRINKS_LEAD_MINUTES);
  const start = Math.ceil(first / DRINKS_SLOT_MINUTES) * DRINKS_SLOT_MINUTES;
  const last = toMin(today.close) - 15;
  const slots: string[] = [];
  for (let m = start; m <= last; m += DRINKS_SLOT_MINUTES) slots.push(toHHMM(m));
  return slots;
}
