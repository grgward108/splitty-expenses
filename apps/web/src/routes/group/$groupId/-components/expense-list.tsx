import { useTranslation } from "@repo/i18n";
import {
  useExpensesList,
  getExpensesListQueryKey,
  useExpensesDelete,
} from "@repo/spec/client/expenses/expenses";
import { getBalancesGetQueryKey } from "@repo/spec/client/balances/balances";
import type { Expense, Group } from "@repo/spec/client/model";
import { Button, Card, CardContent } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const CATEGORY_EMOJI: Record<string, string> = {
  food: "\ud83c\udf54",
  transport: "\ud83d\ude97",
  accommodation: "\ud83c\udfe8",
  entertainment: "\ud83c\udfae",
  shopping: "\ud83d\udecd\ufe0f",
  utilities: "\ud83d\udca1",
  other: "\ud83d\udce6",
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

  const memberMap = new Map(group.members.map((m) => [m.id, m]));

  const data = expensesQuery.data?.data;
  const expenses: Expense[] =
    data && "items" in data ? (data.items as Expense[]) : [];

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
            queryClient.invalidateQueries({
              queryKey: getExpensesListQueryKey(groupId),
            });
            queryClient.invalidateQueries({
              queryKey: getBalancesGetQueryKey(groupId),
            });
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
          <div
            key={i}
            className="h-24 rounded-xl bg-white/60 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-5xl mb-4 block">\ud83d\udcb0</span>
        <p className="text-gray-500 font-medium">{t("noExpenses")}</p>
        <p className="text-gray-400 text-sm mt-1">{t("noExpensesHint")}</p>
      </div>
    );
  }

  const total = expenses.reduce(
    (sum, e) => sum + Number.parseFloat(e.amount),
    0
  );

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500 text-right">
        {t("totalExpenses", { amount: formatAmount(String(total)) })}
      </p>

      {expenses.map((expense) => {
        const paidBy = memberMap.get(expense.paidByMemberId);
        const categoryEmoji =
          CATEGORY_EMOJI[expense.category] ?? CATEGORY_EMOJI.other;
        const splitCount = expense.splits.length;

        return (
          <Card
            key={expense.id}
            className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{categoryEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {expense.description}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {t("paidBy")}{" "}
                        <span className="font-medium text-gray-700">
                          {paidBy
                            ? `${paidBy.emoji} ${paidBy.name}`
                            : "Unknown"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t("splitAmong", { count: splitCount })} &middot;{" "}
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
                      {formatAmount(expense.amount)}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(expense.id)}
                      className="text-xs border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                      {tc("edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(expense.id)}
                      className={`text-xs ${
                        deletingId === expense.id
                          ? "border-red-400 bg-red-50 text-red-600"
                          : "border-red-200 text-red-400 hover:bg-red-50"
                      }`}
                    >
                      {deletingId === expense.id
                        ? te("deleteConfirm")
                        : tc("delete")}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
