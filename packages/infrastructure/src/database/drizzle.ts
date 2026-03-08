import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .mise.local.toml.example to .mise.local.toml and set DATABASE_URL."
  );
}

const client = postgres(connectionString);

export const db = drizzle(client, { schema });
