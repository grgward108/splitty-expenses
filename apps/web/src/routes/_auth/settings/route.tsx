import { useTheme } from "@/contexts/theme";
import { authClient } from "@/lib/auth-client";
import { useTranslation } from "@repo/i18n";
import { useEmailSendTest } from "@repo/spec/client/email/email";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardHeader,
  Heading,
  Input,
  Label,
  Switch,
  Text,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { SettingsFormData } from "./route.model";

export const Route = createFileRoute("/_auth/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation("settings");
  const { t: tCommon } = useTranslation("common");
  const { i18n } = useTranslation();
  const { data: session } = authClient.useSession();
  const { isDark, setIsDark } = useTheme();
  const [formData, setFormData] = useState<SettingsFormData>({
    name: session?.user?.name ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testEmailTo, setTestEmailTo] = useState("");
  const [testEmailMessage, setTestEmailMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const sendTestEmailMutation = useEmailSendTest();

  useEffect(() => {
    if (session?.user?.name !== undefined) {
      setFormData((prev) => ({ ...prev, name: session.user.name ?? "" }));
    }
  }, [session?.user?.name]);

  const user = session?.user;
  if (!user) return null;

  const handleSendTestEmail = async () => {
    setTestEmailMessage(null);
    try {
      const res = await sendTestEmailMutation.mutateAsync({
        data: testEmailTo.trim() ? { to: testEmailTo.trim() } : {},
      });
      const body = res.data as { message?: string; id?: string };
      setTestEmailMessage({
        type: "success",
        text: body.id
          ? t("testEmailSentWithId", {
              message: body.message ?? t("sent"),
              id: body.id,
            })
          : (body.message ?? t("sent")),
      });
    } catch (err: unknown) {
      const e = err as { message?: string; code?: string };
      setTestEmailMessage({
        type: "error",
        text: e.message ?? t("testEmailSendFailed"),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    try {
      const result = await authClient.updateUser({
        name: formData.name,
      });
      if (result.error) {
        setMessage({ type: "error", text: result.error.message ?? t("updateFailed") });
        return;
      }
      setMessage({ type: "success", text: t("profileUpdated") });
    } catch {
      setMessage({ type: "error", text: t("updateFailed") });
    } finally {
      setIsSubmitting(false);
    }
  };

  const languageValue = i18n.language.startsWith("ja") ? "ja" : "en";

  return (
    <div className="space-y-6 w-full">
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
        {t("pageTitle")}
      </h1>

      <Card>
        <CardHeader>
          <Heading level={3}>{t("profile")}</Heading>
          <Text color="muted" size="sm">
            {t("profileDescription")}
          </Text>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar size="xl" className="ring-2 ring-secondary-200 dark:ring-secondary-700">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name ?? ""} />
              ) : (
                <AvatarFallback>
                  {(user.name ?? user.email ?? "?").slice(0, 1).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-sm text-secondary-500 dark:text-secondary-400">
              <p>{t("profileImageFromGoogle")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-secondary-100 dark:bg-secondary-800"
              />
              <p className="text-xs text-secondary-500 dark:text-secondary-400">
                {t("emailCannotChange")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{t("displayName")}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t("displayNamePlaceholder")}
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            {message && (
              <p
                className={
                  message.type === "success"
                    ? "text-sm text-green-600 dark:text-green-400"
                    : "text-sm text-red-600 dark:text-red-400"
                }
              >
                {message.text}
              </p>
            )}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? tCommon("saving") : tCommon("save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Heading level={3}>{t("emailTest")}</Heading>
          <Text color="muted" size="sm">
            {t("emailTestDescription")}
          </Text>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email-to">{t("testEmailTo")}</Label>
            <Input
              id="test-email-to"
              type="email"
              placeholder={t("testEmailPlaceholder")}
              value={testEmailTo}
              onChange={(e) => setTestEmailTo(e.target.value)}
            />
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              {t("testEmailHint", { email: user.email ?? tCommon("notSet") })}
            </p>
          </div>
          {testEmailMessage && (
            <p
              className={
                testEmailMessage.type === "success"
                  ? "text-sm text-green-600 dark:text-green-400"
                  : "text-sm text-red-600 dark:text-red-400"
              }
            >
              {testEmailMessage.text}
            </p>
          )}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={sendTestEmailMutation.isPending}
              onClick={() => void handleSendTestEmail()}
            >
              {sendTestEmailMutation.isPending ? t("sendingTestEmail") : t("sendTestEmail")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Heading level={3}>{t("language")}</Heading>
          <Text color="muted" size="sm">
            {t("languageDescription")}
          </Text>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language-select">{t("language")}</Label>
            <select
              id="language-select"
              value={languageValue}
              onChange={(e) => void i18n.changeLanguage(e.target.value)}
              className="flex h-10 w-full rounded-md border border-secondary-200 bg-white px-3 py-2 text-sm text-secondary-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-900 dark:text-secondary-100"
            >
              <option value="ja">{t("languageJa")}</option>
              <option value="en">{t("languageEn")}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Heading level={3}>{t("display")}</Heading>
          <Text color="muted" size="sm">
            {t("nightModeDescription")}
          </Text>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="night-mode" className="cursor-pointer">
              {t("nightMode")}
            </Label>
            <Switch
              id="night-mode"
              checked={isDark}
              onCheckedChange={setIsDark}
              aria-label={t("nightModeAria")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
