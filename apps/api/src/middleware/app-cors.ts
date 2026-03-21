import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { trustedOriginsForRequest } from "../lib/trusted-origins";
import type { AppEnv } from "../types/app-env";

export const appCorsMiddleware: MiddlewareHandler<AppEnv> = cors({
  origin: (origin, c) => {
    const allowed = new Set(trustedOriginsForRequest(c));
    if (!origin) {
      return null;
    }
    return allowed.has(origin) ? origin : null;
  },
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});
