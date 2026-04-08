import { useTranslation } from "@repo/i18n";
import { useGroupsGet } from "@repo/spec/client/groups/groups";
import type { Group } from "@repo/spec/client/model";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Skeleton,
  Button,
} from "@repo/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExpenseList } from "./-components/expense-list";
import { ExpenseFormDialog } from "./-components/expense-form-dialog";
import { BalanceSummary } from "./-components/balance-summary";
import { MemberList } from "./-components/member-list";
import { ShareLink } from "./-components/share-link";

export const Route = createFileRoute("/group/$groupId")({
  component: GroupPage,
});

function GroupPage() {
  const { groupId } = Route.useParams();
  const { t } = useTranslation("groups");
  const groupQuery = useGroupsGet(groupId);
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  if (groupQuery.isLoading) {
    return <GroupSkeleton />;
  }

  if (groupQuery.isError || !groupQuery.data) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl mb-4 block">\ud83d\ude15</span>
        <p className="text-gray-500 text-lg">{t("groupNotFound")}</p>
      </div>
    );
  }

  const group = groupQuery.data.data as Group;

  if (!("id" in group)) {
    return (
      <div className="text-center py-12">
        <span className="text-4xl mb-4 block">\ud83d\ude15</span>
        <p className="text-gray-500 text-lg">{t("groupNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
          <p className="text-sm text-gray-500">
            {group.currency} &middot; {group.members.length} {t("members").toLowerCase()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShareOpen(!shareOpen)}
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            \ud83d\udcce {t("shareGroup")}
          </Button>
          <Button
            onClick={() => {
              setEditingExpenseId(null);
              setExpenseDialogOpen(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-200"
          >
            + {t("addExpense")}
          </Button>
        </div>
      </div>

      {/* Share Link */}
      {shareOpen && (
        <div className="mb-4">
          <ShareLink groupId={groupId} />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-white/80 backdrop-blur-sm rounded-xl p-1 shadow-sm border border-white/60">
          <TabsTrigger
            value="expenses"
            className="rounded-lg aria-selected:bg-gradient-to-r aria-selected:from-purple-500 aria-selected:to-pink-500 aria-selected:text-white aria-selected:shadow-sm"
          >
            \ud83d\udcb8 {t("expenses")}
          </TabsTrigger>
          <TabsTrigger
            value="balances"
            className="rounded-lg aria-selected:bg-gradient-to-r aria-selected:from-purple-500 aria-selected:to-pink-500 aria-selected:text-white aria-selected:shadow-sm"
          >
            \u2696\ufe0f {t("balances")}
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="rounded-lg aria-selected:bg-gradient-to-r aria-selected:from-purple-500 aria-selected:to-pink-500 aria-selected:text-white aria-selected:shadow-sm"
          >
            \ud83d\udc65 {t("members")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="mt-4">
          <ExpenseList
            groupId={groupId}
            group={group}
            onEdit={(expenseId) => {
              setEditingExpenseId(expenseId);
              setExpenseDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="balances" className="mt-4">
          <BalanceSummary groupId={groupId} currency={group.currency} />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <MemberList groupId={groupId} group={group} />
        </TabsContent>
      </Tabs>

      {/* Expense Dialog */}
      <ExpenseFormDialog
        open={expenseDialogOpen}
        onOpenChange={setExpenseDialogOpen}
        groupId={groupId}
        group={group}
        expenseId={editingExpenseId}
      />
    </div>
  );
}

function GroupSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}
