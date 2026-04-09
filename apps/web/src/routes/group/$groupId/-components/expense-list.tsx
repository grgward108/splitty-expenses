import { useTranslation } from "@repo/i18n";
import {
  useExpensesList,
  getExpensesListQueryKey,
  useExpensesDelete,
} from "@repo/spec/client/expenses/expenses";
import { getBalancesGetQueryKey } from "@repo/spec/client/balances/balances";
import type { Expense, Group } from "@repo/spec/client/model";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const CATEGORY_CONFIG: Record<string, { emoji: string; bg: string }> = {
  food: { emoji: "\ud83c\udf54", bg: "#fff3e0" },
  transport: { emoji: "\ud83d\ude97", bg: "#e3f2fd" },
  accommodation: { emoji: "\ud83c\udfe8", bg: "#f3e5f5" },
  entertainment: { emoji: "\ud83c\udfae", bg: "#e8f5e9" },
  shopping: { emoji: "\ud83d\udecd\ufe0f", bg: "#fce4ec" },
  utilities: { emoji: "\ud83d\udca1", bg: "#fff8e1" },
  other: { emoji: "\ud83d\udce6", bg: "#f5f5f5" },
};

interface ExpenseListProps {
  groupId: string;
  group: Group;
  onEdit: (expenseId: string) => void;
}

export function ExpenseList({ groupId, group, onEdit }: ExpenseListProps) {
  const { t } = useTranslation("groups");
  const { t: te } = useTranslation("expenses");
  const { t: tc } = useTranslation("common");
  const queryClient = useQueryClient();
  const expensesQuery = useExpensesList(groupId);
  const deleteExpense = useExpensesDelete();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const memberMap = new Map(group.members.map((m: { id: string; name: string; emoji: string }) => [m.id, m]));

  const data = expensesQuery.data?.data;
  const expenses: Expense[] = data && "items" in data ? (data.items as Expense[]) : [];

  const formatAmount = (amount: string) => {
    const num = Number.parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: group.currency,
      minimumFractionDigits: 2,
    }).format(num);
  };

  const handleDelete = (expenseId: string) => {
    if (deletingId === expenseId) {
      deleteExpense.mutate(
        { groupId, expenseId },
        {
          onSuccess: () => {
            setDeletingId(null);
            queryClient.invalidateQueries({ queryKey: getExpensesListQueryKey(groupId) });
            queryClient.invalidateQueries({ queryKey: getBalancesGetQueryKey(groupId) });
          },
        }
      );
    } else {
      setDeletingId(expenseId);
    }
  };

  if (expensesQuery.isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: "var(--color-border)" }} />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4 opacity-40">$</div>
        <p className="font-medium text-lg" style={{ color: "var(--color-charcoal)" }}>{t("noExpenses")}</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted)" }}>{t("noExpensesHint")}</p>
      </div>
    );
  }

  const total = expenses.reduce((sum: number, e: Expense) => sum + Number.parseFloat(e.amount), 0);

  return (
    <div>
      {/* Total */}
      <div className="flex items-baseline justify-between mb-4">
        <span className="text-sm font-medium" style={{ color: "var(--color-muted)" }}>
          {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
        </span>
        <span className="font-display text-2xl italic" style={{ color: "var(--color-charcoal)" }}>
          {formatAmount(String(total))}
        </span>
      </div>

      {/* Receipt-style list */}
      <div className="card-surface overflow-hidden">
        <div className="stagger-children">
          {expenses.map((expense: Expense) => {
            const paidBy = memberMap.get(expense.paidByMemberId);
            const cat = CATEGORY_CONFIG[expense.category] ?? CATEGORY_CONFIG.other;

            return (
              <div key={expense.id} className="receipt-item p-4 hover:bg-black/[0.01] transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ background: cat.bg }}
                  >
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold truncate" style={{ color: "var(--color-charcoal)" }}>
                          {expense.description}
                        </p>
                        <p className="text-sm mt-0.5" style={{ color: "var(--color-muted)" }}>
                          {paidBy ? `${paidBy.emoji} ${paidBy.name}` : "?"} &middot;{" "}
                          {new Date(expense.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className="text-lg font-semibold whitespace-nowrap" style={{ color: "var(--color-charcoal)" }}>
                        {formatAmount(expense.amount)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-2 justify-end">
                      <button
                        onClick={() => onEdit(expense.id)}
                        className="text-xs font-medium px-3 py-1 rounded-lg transition-colors"
                        style={{ color: "var(--color-slate)", background: "rgba(0,0,0,0.04)" }}
                      >
                        {tc("edit")}
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-xs font-medium px-3 py-1 rounded-lg transition-colors"
                        style={{
                          color: deletingId === expense.id ? "white" : "var(--color-coral)",
                          background: deletingId === expense.id ? "var(--color-coral)" : "rgba(239,100,97,0.08)",
                        }}
                      >
                        {deletingId === expense.id ? te("deleteConfirm") : tc("delete")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
