import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";
import { getRequiredEnv } from "@/lib/env";

const sql = neon(getRequiredEnv("DATABASE_URL"));
export const db = drizzle({ client: sql, schema });
export * from "@/db/schema";
