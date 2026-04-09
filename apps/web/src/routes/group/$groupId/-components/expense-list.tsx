import { useTranslation } from "@repo/i18n";
import { useExpensesList, getExpensesListQueryKey, useExpensesDelete } from "@repo/spec/client/expenses/expenses";
import { getBalancesGetQueryKey } from "@repo/spec/client/balances/balances";
import type { Expense, Group } from "@repo/spec/client/model";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const CATEGORY_CONFIG: Record<string, { emoji: string; color: string }> = {
  food: { emoji: "\ud83c\udf54", color: "var(--yellow)" },
  transport: { emoji: "\ud83d\ude97", color: "var(--cyan)" },
  accommodation: { emoji: "\ud83c\udfe8", color: "var(--lavender)" },
  entertainment: { emoji: "\ud83c\udfae", color: "var(--lime)" },
  shopping: { emoji: "\ud83d\udecd\ufe0f", color: "var(--pink)" },
  utilities: { emoji: "\ud83d\udca1", color: "var(--yellow)" },
  other: { emoji: "\ud83d\udce6", color: "var(--cyan)" },
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
    return new Intl.NumberFormat("en-US", { style: "currency", currency: group.currency, minimumFractionDigits: 2 }).format(num);
  };

  const handleDelete = (expenseId: string) => {
    if (deletingId === expenseId) {
      deleteExpense.mutate({ groupId, expenseId }, {
        onSuccess: () => {
          setDeletingId(null);
          queryClient.invalidateQueries({ queryKey: getExpensesListQueryKey(groupId) });
          queryClient.invalidateQueries({ queryKey: getBalancesGetQueryKey(groupId) });
        },
      });
    } else {
      setDeletingId(expenseId);
    }
  };

  if (expensesQuery.isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse" style={{ border: "var(--border)" }} />)}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 brutal-card p-8">
        <div className="font-display text-6xl mb-4" style={{ color: "var(--yellow)" }}>$0</div>
        <p className="font-bold text-lg">{t("noExpenses")}</p>
        <p className="text-sm mt-1" style={{ color: "#666" }}>{t("noExpensesHint")}</p>
      </div>
    );
  }

  const total = expenses.reduce((sum: number, e: Expense) => sum + Number.parseFloat(e.amount), 0);

  return (
    <div>
      {/* Total bar */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-xs font-bold" style={{ fontFamily: "'Space Mono', monospace", color: "#666" }}>
          {expenses.length} EXPENSE{expenses.length !== 1 ? "S" : ""}
        </span>
        <div className="inline-block px-3 py-1" style={{ background: "var(--lime)", border: "2px solid var(--black)" }}>
          <span className="font-display text-sm">{formatAmount(String(total))}</span>
        </div>
      </div>

      {/* Expense list */}
      <div className="brutal-card overflow-hidden">
        <div className="stagger">
          {expenses.map((expense: Expense) => {
            const paidBy = memberMap.get(expense.paidByMemberId);
            const cat = CATEGORY_CONFIG[expense.category] ?? CATEGORY_CONFIG.other;

            return (
              <div key={expense.id} className="receipt-cut p-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-11 h-11 flex items-center justify-center text-lg shrink-0"
                    style={{ background: cat.color, border: "2px solid var(--black)" }}
                  >
                    {cat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold truncate">{expense.description}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#666" }}>
                          {paidBy ? `${paidBy.emoji} ${paidBy.name}` : "?"} &middot;{" "}
                          {new Date(expense.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <span className="font-display text-lg whitespace-nowrap">{formatAmount(expense.amount)}</span>
                    </div>
                    <div className="flex gap-2 mt-2 justify-end">
                      <button onClick={() => onEdit(expense.id)} className="btn-brutal-outline text-xs py-1 px-3">{tc("edit")}</button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className="text-xs font-bold py-1 px-3 transition-all"
                        style={{
                          border: "2px solid var(--black)",
                          boxShadow: "2px 2px 0 var(--black)",
                          background: deletingId === expense.id ? "var(--red)" : "var(--white)",
                          color: deletingId === expense.id ? "var(--white)" : "var(--red)",
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
