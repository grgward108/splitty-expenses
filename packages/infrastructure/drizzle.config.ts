import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      (() => {
        throw new Error(
          "DATABASE_URL is not set. Run with `mise run db:generate` or `mise run db:studio` so .mise.local.toml is loaded."
        );
      })(),
  },
});
