import { getAuth, getDb } from "@repo/infrastructure";
import { Hono, type MiddlewareHandler } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import { trustedOriginsForRequest } from "./lib/trusted-origins";
import { appCorsMiddleware } from "./middleware/app-cors";
import mobileAuthRoutes from "./routes/mobile-auth";
import type { AppEnv } from "./types/app-env";

// 生成されたルートをインポート
import generatedRoutes from "./generated/routes";

const app = new Hono<AppEnv>();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use("*", appCorsMiddleware);

// db・auth 遅延初期化ミドルウェア（/api/auth・/api/tasks のみ DB が必要）
// Node.js では process.env、Workers では c.env (Hyperdrive バインディング) から接続文字列を取得
const dbAuthMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const connectionString =
    c.env.HYPERDRIVE?.connectionString ?? c.env.DATABASE_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    return c.json({ message: "DATABASE_URL is not configured", code: "CONFIG_ERROR" }, 500);
  }

  const db = getDb(connectionString);
  const authBaseUrl =
    c.env.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const auth = getAuth({
    db,
    googleClientId: c.env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID ?? "",
    googleClientSecret: c.env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "",
    trustedOrigins: trustedOriginsForRequest(c),
    // Workers では BETTER_AUTH_* が process.env に載らないことがあり、OAuth state 検証が壊れる（please_restart_the_process）
    secret: c.env.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET,
    baseURL: authBaseUrl,
  });

  c.set("db", db);
  c.set("auth", auth);
  await next();
};

app.use("/api/auth/*", dbAuthMiddleware);
app.use("/api/tasks/*", dbAuthMiddleware);

// セッションミドルウェア（タスク API のみ c.get("user") / c.get("session") をセット）
const sessionMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  const auth = c.get("auth");
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  await next();
};

app.use("/api/tasks/*", sessionMiddleware);

app.route("/", mobileAuthRoutes);

// Better Auth ハンドラー（/api/auth/* へのその他すべてのリクエストを処理）
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  const auth = c.get("auth");
  return auth.handler(c.req.raw);
});

// 生成されたルートをマウント
app.route("/", generatedRoutes);

// Root endpoint
app.get("/", (c) => {
  return c.json({
    name: "Monorepo API",
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
