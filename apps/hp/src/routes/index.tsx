import { useTranslation } from "@repo/i18n";
import { Card, CardContent, Heading, Text } from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { t } = useTranslation("landing");
  return (
    <Card className="border-secondary-200 shadow-card dark:border-secondary-800">
      <CardContent className="p-8">
        <Heading level={1} className="mb-2 text-secondary-900 dark:text-secondary-50">
          {t("heroTitle")}
        </Heading>
        <Text className="text-secondary-600 dark:text-secondary-400">{t("placeholder")}</Text>
      </CardContent>
    </Card>
  );
}
