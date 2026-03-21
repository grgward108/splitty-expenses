import { zValidator } from "@hono/zod-validator";
import { createEmailClient, renderTestWelcomeEmail, sendEmail } from "@repo/email";
import { createFactory } from "hono/factory";
import type { EmailSendTestContext } from "../generated/endpoints/email/email.context";
import { emailSendTestBody } from "../generated/endpoints/email/email.zod";

const factory = createFactory();

export const emailSendTestHandlers = factory.createHandlers(
  zValidator("json", emailSendTestBody),
  async (c: EmailSendTestContext) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "Unauthorized", code: "UNAUTHORIZED" }, 401);
    }

    const apiKey = c.env.RESEND_API_KEY ?? process.env.RESEND_API_KEY;
    if (!apiKey) {
      return c.json({ message: "RESEND_API_KEY is not configured", code: "CONFIG_ERROR" }, 503);
    }

    const from = c.env.RESEND_FROM_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? "";
    if (!from) {
      return c.json(
        {
          message:
            "RESEND_FROM_EMAIL is not configured (例: Monorepo <onboarding@resend.dev> または検証済みドメインの From)",
          code: "CONFIG_ERROR",
        },
        503
      );
    }

    const body = c.req.valid("json");
    const to = body.to?.trim() || user.email;
    if (!to) {
      return c.json(
        {
          message:
            "送信先メールアドレスがありません（to を指定するか、ユーザーに email を設定してください）",
          code: "BAD_REQUEST",
        },
        400
      );
    }

    try {
      const client = createEmailClient(apiKey);
      const displayName = user.name ?? user.email ?? "ユーザー";
      const data = await sendEmail(client, {
        from,
        to,
        subject: "テストメール（Monorepo）",
        react: renderTestWelcomeEmail(displayName),
      });

      return c.json({
        message: "送信しました",
        id: data?.id,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "メール送信に失敗しました";
      return c.json({ message, code: "EMAIL_SEND_FAILED" }, 502);
    }
  }
);
