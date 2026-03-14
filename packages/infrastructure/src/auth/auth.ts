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
}

const cachedAuthByDb = new WeakMap<DrizzleDatabase, Map<string, unknown>>();

function getAuthCacheKey(config: Omit<AuthConfig, "db">): string {
  return JSON.stringify({
    googleClientId: config.googleClientId,
    googleClientSecret: config.googleClientSecret,
    trustedOrigins: [...config.trustedOrigins].sort(),
  });
}

/**
 * Better Auth インスタンスを取得する。同一プロセス内ではキャッシュされたインスタンスを返す。
 *
 * - Node.js: `getAuth({ db: getDb(process.env.DATABASE_URL), ... })`
 * - Cloudflare Workers: `getAuth({ db: getDb(c.env.HYPERDRIVE.connectionString), ... })`
 */
export function getAuth(config: AuthConfig) {
  const cacheKey = getAuthCacheKey(config);
  let authByConfig = cachedAuthByDb.get(config.db);
  if (!authByConfig) {
    authByConfig = new Map<string, unknown>();
    cachedAuthByDb.set(config.db, authByConfig);
  }

  const cachedAuth = authByConfig.get(cacheKey);
  if (cachedAuth) {
    return cachedAuth as ReturnType<typeof betterAuth>;
  }

  const auth = betterAuth({
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
