import { getDb } from "@repo/infrastructure";
import { Hono, type MiddlewareHandler } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import { appCorsMiddleware } from "./middleware/app-cors";
import type { AppEnv } from "./types/app-env";

import generatedRoutes from "./generated/routes";

const app = new Hono<AppEnv>();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", appCorsMiddleware);

// DB middleware for API routes
const dbMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const connectionString =
    c.env.HYPERDRIVE?.connectionString ?? c.env.DATABASE_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    return c.json({ message: "DATABASE_URL is not configured", code: "CONFIG_ERROR" }, 500);
  }

  const db = getDb(connectionString);
  c.set("db", db);
  await next();
};

app.use("/api/groups/*", dbMiddleware);
app.use("/api/health/*", dbMiddleware);

// Generated routes
app.route("/", generatedRoutes);

// Root endpoint
app.get("/", (c) => {
  return c.json({
    name: "Splitty API",
    version: "0.0.0",
    docs: "/api/health",
  });
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      message: "Not Found",
      code: "NOT_FOUND",
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json(
    {
      message: err.message || "Internal Server Error",
      code: "INTERNAL_ERROR",
    },
    500
  );
});

export { app };
