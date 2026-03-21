import { createFactory } from "hono/factory";
import type { MobileAuthCallbackContext } from "../generated/endpoints/mobile-auth/mobile-auth.context";
import type { AppEnv } from "../types/app-env";

const factory = createFactory();

export const mobileAuthCallbackHandlers = factory.createHandlers(
  async (c: MobileAuthCallbackContext<AppEnv>) => {
    const auth = c.get("auth");
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session?.session?.token) {
      return c.redirect("monorepoapp://auth/error?message=auth_failed");
    }

    const token = session.session.token;
    return c.redirect(`monorepoapp://auth/callback?token=${encodeURIComponent(token)}`);
  }
);
