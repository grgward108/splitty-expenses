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
    origin: [
      "http://localhost:5173",
      "http://localhost:8100",
      "capacitor://localhost",
      "https://localhost",
    ],
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

// モバイル OAuth エンドポイント（better-auth の /api/auth/* ワイルドカードより前に登録する）
// システムブラウザで Google OAuth を開始し、ディープリンクでトークンを返す
app.get("/api/auth/mobile/google", async (c) => {
  const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const callbackURL = `${baseUrl}/api/auth/mobile/callback`;

  const authReq = new Request(`${baseUrl}/api/auth/sign-in/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "google", callbackURL }),
  });

  const authRes = await auth.handler(authReq);

  // Google OAuth URL を取得（リダイレクトまたは JSON レスポンスに対応）
  let googleUrl: string | null = null;
  if (authRes.status >= 300 && authRes.status < 400) {
    googleUrl = authRes.headers.get("location");
  } else {
    const body = (await authRes.json()) as { url?: string };
    googleUrl = body.url ?? null;
  }

  if (!googleUrl) {
    return c.json({ error: "Failed to initiate OAuth" }, 500);
  }

  // リダイレクトレスポンスを作成し、state クッキーを必ずコピーする
  // state クッキーは OAuth コールバック時の CSRF 検証に必須
  const responseHeaders = new Headers({ Location: googleUrl });
  const setCookies =
    typeof authRes.headers.getSetCookie === "function"
      ? authRes.headers.getSetCookie()
      : ([authRes.headers.get("set-cookie")].filter(Boolean) as string[]);

  for (const cookie of setCookies) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new Response(null, { status: 302, headers: responseHeaders });
});

// Google OAuth 完了後のコールバック: セッショントークンをディープリンクでアプリに渡す
app.get("/api/auth/mobile/callback", async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.session?.token) {
    return c.redirect("monorepoapp://auth/error?message=auth_failed");
  }

  const token = session.session.token;
  return c.redirect(`monorepoapp://auth/callback?token=${encodeURIComponent(token)}`);
});

// Better Auth ハンドラー（/api/auth/* へのその他すべてのリクエストを処理）
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
