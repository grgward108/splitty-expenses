import { Body, Container, Head, Html, Preview, Section } from "@react-email/components";
import type { ReactNode } from "react";

export type EmailLayoutProps = {
  /** 受信トレイ用の短いプレビュー文 */
  preview?: string;
  children: ReactNode;
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "24px 20px 48px",
  marginBottom: "64px",
  borderRadius: "8px",
  maxWidth: "560px",
};

/**
 * メール共通の外枠（Html / Body / Container）。
 */
export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="ja">
      <Head />
      {preview ? <Preview>{preview}</Preview> : null}
      <Body style={main}>
        <Container style={container}>
          <Section>{children}</Section>
        </Container>
      </Body>
    </Html>
  );
}
