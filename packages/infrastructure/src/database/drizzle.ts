import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

export type DrizzleDatabase = PostgresJsDatabase<typeof schema>;

const cachedDbByConnectionString = new Map<string, DrizzleDatabase>();

/**
 * データベース接続を取得する。同一プロセス内ではキャッシュされたインスタンスを返す。
 *
 * - Node.js: `getDb(process.env.DATABASE_URL)`
 * - Cloudflare Workers: `getDb(c.env.HYPERDRIVE.connectionString)`
 */
export function getDb(connectionString: string): DrizzleDatabase {
  const cachedDb = cachedDbByConnectionString.get(connectionString);
  if (cachedDb) {
    return cachedDb;
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });
  cachedDbByConnectionString.set(connectionString, db);
  return db;
}
