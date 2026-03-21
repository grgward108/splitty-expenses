import type { DrizzleDatabase, getAuth } from "@repo/infrastructure";

export type Auth = ReturnType<typeof getAuth>;
export type AuthUser = Auth["$Infer"]["Session"]["user"];
export type AuthSession = Auth["$Infer"]["Session"]["session"];

export type AppBindings = {
  DATABASE_URL?: string;
  HYPERDRIVE?: {
    connectionString?: string;
  };
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  BETTER_AUTH_SECRET?: string;
  BETTER_AUTH_URL?: string;
  /** Resend API キー（Workers では `wrangler secret put RESEND_API_KEY`） */
  RESEND_API_KEY?: string;
  /** Resend の From（例: `Monorepo <noreply@example.com>`）。検証済みドメインまたは Resend のテスト用アドレス */
  RESEND_FROM_EMAIL?: string;
};

export type AppEnv = {
  Bindings: AppBindings;
  Variables: {
    user: AuthUser | null;
    session: AuthSession | null;
    db: DrizzleDatabase;
    auth: Auth;
  };
};
