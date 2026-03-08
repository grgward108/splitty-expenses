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
          "DATABASE_URL is not set. Copy .mise.local.toml.example to .mise.local.toml and set DATABASE_URL."
        );
      })(),
  },
});
