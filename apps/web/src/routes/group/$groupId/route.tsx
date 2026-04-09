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
    return <GroupSkeleton />;
  }

  if (groupQuery.isError || !groupQuery.data) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl block mb-4">:/</span>
        <p className="text-lg font-medium" style={{ color: "var(--color-muted)" }}>{t("groupNotFound")}</p>
      </div>
    );
  }

  const group = groupQuery.data.data as Group;
  if (!("id" in group)) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl block mb-4">:/</span>
        <p className="text-lg font-medium" style={{ color: "var(--color-muted)" }}>{t("groupNotFound")}</p>
      </div>
    );
  }

  const tabs: { value: TabValue; label: string }[] = [
    { value: "expenses", label: t("expenses") },
    { value: "balances", label: t("balances") },
    { value: "members", label: t("members") },
  ];

  return (
    <div className="animate-slide-up">
      {/* Group Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl italic tracking-tight" style={{ color: "var(--color-charcoal)" }}>
            {group.name}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
              {group.currency}
            </span>
            <span style={{ color: "var(--color-border)" }}>&bull;</span>
            <span className="text-sm" style={{ color: "var(--color-muted)" }}>
              {group.members.length} {t("members").toLowerCase()}
            </span>
            <div className="flex -space-x-1.5 ml-1">
              {group.members.slice(0, 5).map((m) => (
                <span key={m.id} className="text-base" title={m.name}>{m.emoji}</span>
              ))}
              {group.members.length > 5 && (
                <span className="text-xs font-medium pl-1" style={{ color: "var(--color-muted)" }}>
                  +{group.members.length - 5}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShareOpen(!shareOpen)}
            className="btn-secondary text-sm flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            {t("shareGroup")}
          </button>
          <button
            onClick={() => { setEditingExpenseId(null); setExpenseDialogOpen(true); }}
            className="btn-primary text-sm flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {t("addExpense")}
          </button>
        </div>
      </div>

      {/* Share Link */}
      {shareOpen && (
        <div className="mb-5 animate-slide-up">
          <ShareLink groupId={groupId} />
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex p-1 rounded-xl mb-5"
        style={{ background: "rgba(0,0,0,0.04)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.value ? "tab-active" : ""
            }`}
            style={activeTab !== tab.value ? { color: "var(--color-muted)" } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-slide-up" key={activeTab}>
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
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="h-10 w-56 rounded-lg animate-pulse" style={{ background: "var(--color-border)" }} />
        <div className="h-4 w-32 rounded animate-pulse" style={{ background: "var(--color-border)" }} />
      </div>
      <div className="h-12 w-full rounded-xl animate-pulse" style={{ background: "var(--color-border)" }} />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "var(--color-border)" }} />
        ))}
      </div>
    </div>
  );
}
