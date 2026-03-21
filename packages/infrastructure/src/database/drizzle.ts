import { type PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

export type DrizzleDatabase = PostgresJsDatabase<typeof schema>;

const cachedDbByConnectionString = new Map<string, DrizzleDatabase>();

function readEnv(key: string): string | undefined {
  try {
    return typeof process !== "undefined" && process.env ? process.env[key] : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Workers では TCP がリクエストに紐づくためクライアントを跨リクエストで共有できない。
 * Node（`tsx` / `node` の Hono）は接続をプールして使い回す。
 */
function usePerRequestPostgresClient(): boolean {
  if (readEnv("FORCE_DB_PER_REQUEST") === "1" || readEnv("FORCE_DB_PER_REQUEST") === "true") {
    return true;
  }
  if (readEnv("FORCE_DB_SINGLETON") === "1" || readEnv("FORCE_DB_SINGLETON") === "true") {
    return false;
  }
  // Cloudflare Workers / workerd では Cache Storage の `caches.default` が存在する
  if (typeof caches !== "undefined" && "default" in caches) {
    return true;
  }
  return false;
}

/**
 * データベース接続を取得する。
 *
 * - **Node.js（ローカル dev）**: 同一接続文字列はシングルトン（プール再利用）でレイテンシを抑える
 * - **Cloudflare Workers**: リクエストごとに新規クライアント（I/O コンテキスト制約）。Hyperdrive がプールする
 *
 * 上書き: `FORCE_DB_PER_REQUEST=true` / `FORCE_DB_SINGLETON=true`
 */
export function getDb(connectionString: string): DrizzleDatabase {
  if (!usePerRequestPostgresClient()) {
    const hit = cachedDbByConnectionString.get(connectionString);
    if (hit) {
      return hit;
    }
    const client = postgres(connectionString);
    const db = drizzle(client, { schema });
    cachedDbByConnectionString.set(connectionString, db);
    return db;
  }

  const client = postgres(connectionString);
  return drizzle(client, { schema });
}
