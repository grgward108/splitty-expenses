import { auth } from "@repo/infrastructure";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

// 生成されたルートをインポート
import generatedRoutes from "./generated/routes";

type AuthUser = typeof auth.$Infer.Session.user;
type AuthSession = typeof auth.$Infer.Session.session;

const app = new Hono<{
  Variables: {
    user: AuthUser | null;
    session: AuthSession | null;
  };
}>();

// Middleware
app.use("*", logger());
app.use("*", prettyJSON());
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:8100"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// セッションミドルウェア（全ルートで c.get("user") / c.get("session") を利用可能に）
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set("user", session?.user ?? null);
  c.set("session", session?.session ?? null);
  await next();
});

// Better Auth ハンドラー
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// 生成されたルートをマウント
app.route("/", generatedRoutes);

// Root endpoint
app.get("/", (c) => {
  return c.json({
    name: "Monorepo API",
    version: "0.0.0",
    docs: "/health",
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
