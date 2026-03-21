import { Hono } from "hono";
import type { AppEnv } from "../types/app-env";

const mobileAuthRoutes = new Hono<AppEnv>();

// モバイル OAuth エンドポイント（better-auth の /api/auth/* ワイルドカードより前に登録する）
// システムブラウザで Google OAuth を開始し、ディープリンクでトークンを返す
mobileAuthRoutes.get("/api/auth/mobile/google", async (c) => {
  const auth = c.get("auth");
  const baseUrl = c.env.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
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
mobileAuthRoutes.get("/api/auth/mobile/callback", async (c) => {
  const auth = c.get("auth");
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.session?.token) {
    return c.redirect("monorepoapp://auth/error?message=auth_failed");
  }

  const token = session.session.token;
  return c.redirect(`monorepoapp://auth/callback?token=${encodeURIComponent(token)}`);
});

export default mobileAuthRoutes;
