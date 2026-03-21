import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import type { DrizzleDatabase } from "../database/drizzle.js";
import * as schema from "../database/schema.js";

export interface AuthConfig {
  db: DrizzleDatabase;
  googleClientId: string;
  googleClientSecret: string;
  trustedOrigins: string[];
  /** セッション・OAuth state 署名用。Cloudflare Workers では c.env から渡す（process.env に載らないことがある） */
  secret?: string;
  /** 公開 URL のオリジン（例: https://xxx.workers.dev）。コールバック URL・Cookie に影響 */
  baseURL?: string;
}

const cachedAuthByDb = new WeakMap<DrizzleDatabase, Map<string, unknown>>();

function getAuthCacheKey(config: Omit<AuthConfig, "db">): string {
  return JSON.stringify({
    googleClientId: config.googleClientId,
    googleClientSecret: config.googleClientSecret,
    trustedOrigins: [...config.trustedOrigins].sort(),
    secret: config.secret ?? "",
    baseURL: config.baseURL ?? "",
  });
}

/**
 * Better Auth インスタンスを取得する。
 *
 * - **Node + シングルトン DB**: 同一 `db` 参照に対して設定キーごとにキャッシュ（初期化コスト削減）
 * - **Workers（リクエストごとに新しい db）**: `db` が毎回別インスタンスのため実質キャッシュされない
 */
export function getAuth(config: AuthConfig) {
  const cacheKey = getAuthCacheKey(config);
  let authByConfig = cachedAuthByDb.get(config.db);
  if (!authByConfig) {
    authByConfig = new Map();
    cachedAuthByDb.set(config.db, authByConfig);
  }

  const cached = authByConfig.get(cacheKey);
  if (cached) {
    return cached as ReturnType<typeof betterAuth>;
  }

  const auth = betterAuth({
    ...(config.secret !== undefined ? { secret: config.secret } : {}),
    ...(config.baseURL !== undefined ? { baseURL: config.baseURL } : {}),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
        strategy: "compact",
      },
    },
    database: drizzleAdapter(config.db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    plugins: [bearer()],
    socialProviders: {
      google: {
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
      },
    },
    trustedOrigins: config.trustedOrigins,
  });

  authByConfig.set(cacheKey, auth);
  return auth;
}
