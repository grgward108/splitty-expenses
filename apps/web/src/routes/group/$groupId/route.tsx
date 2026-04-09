import { useTranslation } from "@repo/i18n";
import { useGroupsGet } from "@repo/spec/client/groups/groups";
import type { Group } from "@repo/spec/client/model";
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

type TabValue = "expenses" | "balances" | "members";

function GroupPage() {
  const { groupId } = Route.useParams();
  const { t } = useTranslation("groups");
  const groupQuery = useGroupsGet(groupId);
  const [activeTab, setActiveTab] = useState<TabValue>("expenses");
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  if (groupQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 w-56 animate-pulse" style={{ background: "var(--yellow)", border: "var(--border)" }} />
        <div className="h-12 w-full animate-pulse" style={{ border: "var(--border)" }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse" style={{ border: "var(--border)" }} />
        ))}
      </div>
    );
  }

  if (groupQuery.isError || !groupQuery.data) {
    return (
      <div className="text-center py-16">
        <div className="inline-block px-4 py-2 font-display text-lg" style={{ background: "var(--red)", border: "var(--border)", color: "var(--white)" }}>
          {t("groupNotFound")}
        </div>
      </div>
    );
  }

  const group = groupQuery.data.data as Group;
  if (!("id" in group)) {
    return (
      <div className="text-center py-16">
        <div className="inline-block px-4 py-2 font-display text-lg" style={{ background: "var(--red)", border: "var(--border)", color: "var(--white)" }}>
          {t("groupNotFound")}
        </div>
      </div>
    );
  }

  const tabs: { value: TabValue; label: string; color: string }[] = [
    { value: "expenses", label: t("expenses"), color: "var(--yellow)" },
    { value: "balances", label: t("balances"), color: "var(--cyan)" },
    { value: "members", label: t("members"), color: "var(--lavender)" },
  ];

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <div className="inline-block px-3 py-1 mb-2" style={{ background: "var(--cyan)", border: "2px solid var(--black)", transform: "rotate(-1deg)" }}>
            <span className="text-xs font-bold" style={{ fontFamily: "'Space Mono', monospace" }}>
              {group.currency} / {group.members.length} {t("members").toLowerCase()}
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl leading-none">
            {group.name}
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShareOpen(!shareOpen)} className="btn-brutal-outline">
            {t("shareGroup")}
          </button>
          <button
            onClick={() => { setEditingExpenseId(null); setExpenseDialogOpen(true); }}
            className="btn-brutal"
          >
            + {t("addExpense")}
          </button>
        </div>
      </div>

      {/* Share */}
      {shareOpen && <div className="mb-5 animate-pop"><ShareLink groupId={groupId} /></div>}

      {/* Tabs */}
      <div className="flex gap-0 mb-5 -mx-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`tab-brutal flex-1 ${activeTab === tab.value ? "active" : ""}`}
            style={activeTab === tab.value ? {} : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div key={activeTab} className="animate-in">
        {activeTab === "expenses" && (
          <ExpenseList
            groupId={groupId}
            group={group}
            onEdit={(expenseId: string) => { setEditingExpenseId(expenseId); setExpenseDialogOpen(true); }}
          />
        )}
        {activeTab === "balances" && <BalanceSummary groupId={groupId} currency={group.currency} />}
        {activeTab === "members" && <MemberList groupId={groupId} group={group} />}
      </div>

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
