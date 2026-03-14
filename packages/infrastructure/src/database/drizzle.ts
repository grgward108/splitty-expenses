import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

export type DrizzleDatabase = PostgresJsDatabase<typeof schema>;

let cachedDb: DrizzleDatabase | null = null;

/**
 * データベース接続を取得する。同一プロセス内ではキャッシュされたインスタンスを返す。
 *
 * - Node.js: `getDb(process.env.DATABASE_URL)`
 * - Cloudflare Workers: `getDb(c.env.HYPERDRIVE.connectionString)`
 */
export function getDb(connectionString: string): DrizzleDatabase {
  if (!cachedDb) {
    const client = postgres(connectionString);
    cachedDb = drizzle(client, { schema });
  }
  return cachedDb;
}
