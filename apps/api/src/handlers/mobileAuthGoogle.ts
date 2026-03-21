import { createFactory } from "hono/factory";
import type { MobileAuthGoogleContext } from "../generated/endpoints/mobile-auth/mobile-auth.context";
import type { AppEnv } from "../types/app-env";

const factory = createFactory();

export const mobileAuthGoogleHandlers = factory.createHandlers(
  async (c: MobileAuthGoogleContext<AppEnv>) => {
    const auth = c.get("auth");
    const baseUrl = c.env.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    const callbackURL = `${baseUrl}/api/auth/mobile/callback`;

    const authReq = new Request(`${baseUrl}/api/auth/sign-in/social`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "google", callbackURL }),
    });

    const authRes = await auth.handler(authReq);

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

    const setCookies =
      typeof authRes.headers.getSetCookie === "function"
        ? authRes.headers.getSetCookie()
        : ([authRes.headers.get("set-cookie")].filter(Boolean) as string[]);

    for (const cookie of setCookies) {
      c.header("Set-Cookie", cookie, { append: true });
    }

    return c.redirect(googleUrl, 302);
  }
);
