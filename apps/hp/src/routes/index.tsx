import { Card, CardContent, Heading, Text } from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  return (
    <Card className="border-secondary-200 shadow-card dark:border-secondary-800">
      <CardContent className="p-8">
        <Heading level={1} className="mb-2 text-secondary-900 dark:text-secondary-50">
          HP
        </Heading>
        <Text className="text-secondary-600 dark:text-secondary-400">
          コンテンツは今後追加予定です。
        </Text>
      </CardContent>
    </Card>
  );
}
