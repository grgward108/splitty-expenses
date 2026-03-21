import { Resend } from "resend";

/**
 * Resend クライアントを生成する。
 * API キーは環境変数 `RESEND_API_KEY` などから取得して渡す。
 */
export function createEmailClient(apiKey: string): Resend {
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("RESEND_API_KEY is required to send email");
  }
  return new Resend(apiKey);
}
