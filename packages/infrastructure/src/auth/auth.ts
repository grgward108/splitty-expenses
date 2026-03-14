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

// biome-ignore lint/suspicious/noExplicitAny: Better Auth の型推論が複雑なため any でキャッシュ
let cachedAuth: any = null;

/**
 * Better Auth インスタンスを取得する。同一プロセス内ではキャッシュされたインスタンスを返す。
 *
 * - Node.js: `getAuth({ db: getDb(process.env.DATABASE_URL), ... })`
 * - Cloudflare Workers: `getAuth({ db: getDb(c.env.HYPERDRIVE.connectionString), ... })`
 */
export function getAuth(config: AuthConfig) {
  if (!cachedAuth) {
    cachedAuth = betterAuth({
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
  }
  return cachedAuth;
}
