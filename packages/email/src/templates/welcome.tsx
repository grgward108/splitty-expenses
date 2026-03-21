import { Heading, Text } from "@react-email/components";
import { EmailLayout } from "./components/layout.js";

export type WelcomeEmailProps = {
  name: string;
};

/**
 * 動作確認・サンプル用のウェルカムメール。
 */
export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`ようこそ、${name} さん`}>
      <Heading style={{ fontSize: "24px", marginBottom: "16px" }}>ようこそ</Heading>
      <Text style={{ fontSize: "16px", lineHeight: "24px", marginBottom: "8px" }}>
        {name} さん、ご登録ありがとうございます。
      </Text>
      <Text style={{ fontSize: "14px", lineHeight: "22px", color: "#525f7f" }}>
        このメールは @repo/email
        のサンプルテンプレートです。必要に応じて文言やレイアウトを差し替えてください。
      </Text>
    </EmailLayout>
  );
}
