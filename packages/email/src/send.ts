import type { ReactElement } from "react";
import type { Resend } from "resend";

export type SendEmailOptions = {
  from: string;
  to: string | string[];
  subject: string;
  react: ReactElement;
};

/**
 * React Email コンポーネントを HTML にレンダリングし、Resend 経由で送信する。
 */
export async function sendEmail(client: Resend, options: SendEmailOptions) {
  const { data, error } = await client.emails.send({
    from: options.from,
    to: options.to,
    subject: options.subject,
    react: options.react,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
