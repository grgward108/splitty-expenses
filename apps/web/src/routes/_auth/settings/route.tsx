import { useTheme } from "@/contexts/theme";
import { authClient } from "@/lib/auth-client";
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
  const { data: session } = authClient.useSession();
  const { isDark, setIsDark } = useTheme();
  const [formData, setFormData] = useState<SettingsFormData>({
    name: session?.user?.name ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (session?.user?.name !== undefined) {
      setFormData((prev) => ({ ...prev, name: session.user.name ?? "" }));
    }
  }, [session?.user?.name]);

  const user = session?.user;
  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    try {
      const result = await authClient.updateUser({
        name: formData.name,
      });
      if (result.error) {
        setMessage({ type: "error", text: result.error.message ?? "更新に失敗しました" });
        return;
      }
      setMessage({ type: "success", text: "プロフィールを更新しました" });
    } catch {
      setMessage({ type: "error", text: "更新に失敗しました" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <h1 className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">設定</h1>

      <Card>
        <CardHeader>
          <Heading level={3}>プロフィール</Heading>
          <Text color="muted" size="sm">
            表示名とプロフィール画像を管理します。
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
              <p>プロフィール画像は Google アカウントから取得しています。</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-secondary-100 dark:bg-secondary-800"
              />
              <p className="text-xs text-secondary-500 dark:text-secondary-400">
                メールアドレスは変更できません
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">表示名</Label>
              <Input
                id="name"
                type="text"
                placeholder="表示名"
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
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Heading level={3}>表示</Heading>
          <Text color="muted" size="sm">
            ナイトモードのオン・オフを切り替えます。
          </Text>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="night-mode" className="cursor-pointer">
              ナイトモード
            </Label>
            <Switch
              id="night-mode"
              checked={isDark}
              onCheckedChange={setIsDark}
              aria-label="ナイトモード"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
