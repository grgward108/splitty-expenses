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
