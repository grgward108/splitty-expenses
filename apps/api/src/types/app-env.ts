import type { DrizzleDatabase } from "@repo/infrastructure";

export type AppBindings = {
  DATABASE_URL?: string;
  HYPERDRIVE?: {
    connectionString?: string;
  };
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
};

export type AppEnv = {
  Bindings: AppBindings;
  Variables: {
    db: DrizzleDatabase;
  };
};
