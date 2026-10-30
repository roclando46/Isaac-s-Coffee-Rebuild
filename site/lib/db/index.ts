import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

let client: ReturnType<typeof drizzle<typeof schema>> | null = null;

/** Database client, created on first use so pages build without DATABASE_URL. */
export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = drizzle(neon(url), { schema });
  }
  return client;
}

export const hasDb = () => Boolean(process.env.DATABASE_URL || client);

/** Tests swap in an in-memory database. */
export function setDbForTests(test: unknown) {
  client = test as typeof client;
}
export * from "./schema";
