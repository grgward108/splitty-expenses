import { useTranslation } from "@repo/i18n";
import {
  useExpensesCreate,
  useExpensesGet,
  useExpensesUpdate,
  getExpensesListQueryKey,
} from "@repo/spec/client/expenses/expenses";
import { getBalancesGetQueryKey } from "@repo/spec/client/balances/balances";
import type {
  Group,
  ExpenseCategory,
  CreateExpenseSplitInput,
} from "@repo/spec/client/model";
// SplitType values used inline as "equal" | "exact"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Checkbox,
} from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";

const CATEGORY_OPTIONS: {
  value: ExpenseCategory;
  emoji: string;
  labelKey: string;
}[] = [
  { value: "food", emoji: "\ud83c\udf54", labelKey: "food" },
  { value: "transport", emoji: "\ud83d\ude97", labelKey: "transport" },
  { value: "accommodation", emoji: "\ud83c\udfe8", labelKey: "accommodation" },
  { value: "entertainment", emoji: "\ud83c\udfae", labelKey: "entertainment" },
  { value: "shopping", emoji: "\ud83d\udecd\ufe0f", labelKey: "shopping" },
  { value: "utilities", emoji: "\ud83d\udca1", labelKey: "utilities" },
  { value: "other", emoji: "\ud83d\udce6", labelKey: "other" },
];

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  group: Group;
  expenseId: string | null;
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  groupId,
  group,
  expenseId,
}: ExpenseFormDialogProps) {
  const { t } = useTranslation("expenses");
  const { t: tc } = useTranslation("common");
  const queryClient = useQueryClient();
  const createExpense = useExpensesCreate();
  const updateExpense = useExpensesUpdate();

  const isEditing = !!expenseId;
  const expenseQuery = useExpensesGet(groupId, expenseId ?? "", {
    query: { enabled: isEditing && open },
  });

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidByMemberId, setPaidByMemberId] = useState("");
  const [splitType, setSplitType] = useState<"equal" | "exact">("equal");
  const [category, setCategory] = useState<ExpenseCategory>("other");
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(
    new Set()
  );
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState("");

  // Initialize form
  useEffect(() => {
    if (!open) return;

    if (isEditing && expenseQuery.data) {
      const expense = expenseQuery.data.data;
      if ("id" in expense) {
        setDescription(expense.description);
        setAmount(expense.amount);
        setPaidByMemberId(expense.paidByMemberId);
        setSplitType(expense.splitType);
        setCategory(expense.category);
        setSelectedMemberIds(
          new Set(expense.splits.map((s) => s.memberId))
        );
        const amounts: Record<string, string> = {};
        for (const split of expense.splits) {
          amounts[split.memberId] = split.amount;
        }
        setExactAmounts(amounts);
      }
    } else if (!isEditing) {
      setDescription("");
      setAmount("");
      setPaidByMemberId(group.members[0]?.id ?? "");
      setSplitType("equal");
      setCategory("other");
      setSelectedMemberIds(new Set(group.members.map((m) => m.id)));
      setExactAmounts({});
    }
    setValidationError("");
  }, [open, isEditing, expenseQuery.data, group.members]);

  const selectedMembers = group.members.filter((m) =>
    selectedMemberIds.has(m.id)
  );

  const equalAmount = useMemo(() => {
    if (selectedMembers.length === 0 || !amount) return "0.00";
    const total = Number.parseFloat(amount);
    if (Number.isNaN(total)) return "0.00";
    return (total / selectedMembers.length).toFixed(2);
  }, [amount, selectedMembers.length]);

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const buildSplits = (): CreateExpenseSplitInput[] => {
    if (splitType === "equal") {
      return selectedMembers.map((m) => ({
        memberId: m.id,
        amount: equalAmount,
      }));
    }
    return selectedMembers.map((m) => ({
      memberId: m.id,
      amount: exactAmounts[m.id] ?? "0",
    }));
  };

  const validateSplits = (): boolean => {
    if (selectedMembers.length === 0) return false;
    if (splitType === "exact") {
      const total = Number.parseFloat(amount);
      const splitTotal = selectedMembers.reduce(
        (sum, m) => sum + Number.parseFloat(exactAmounts[m.id] ?? "0"),
        0
      );
      if (Math.abs(total - splitTotal) > 0.01) {
        setValidationError(t("splitMismatch"));
        return false;
      }
    }
    setValidationError("");
    return true;
  };

  const handleSubmit = () => {
    if (!description.trim() || !amount || !paidByMemberId) return;
    if (!validateSplits()) return;

    const splits = buildSplits();
    const data = {
      description: description.trim(),
      amount,
      paidByMemberId,
      splitType: splitType as "equal" | "exact",
      category,
      splits,
    };

    const onSuccess = () => {
      queryClient.invalidateQueries({
        queryKey: getExpensesListQueryKey(groupId),
      });
      queryClient.invalidateQueries({
        queryKey: getBalancesGetQueryKey(groupId),
      });
      onOpenChange(false);
    };

    if (isEditing && expenseId) {
      updateExpense.mutate(
        { groupId, expenseId, data },
        { onSuccess }
      );
    } else {
      createExpense.mutate({ groupId, data }, { onSuccess });
    }
  };

  const isPending = createExpense.isPending || updateExpense.isPending;
  const canSubmit =
    description.trim() && amount && paidByMemberId && selectedMembers.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {isEditing ? t("editExpense") : t("addExpense")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Description */}
          <div className="space-y-2">
            <Label>{t("description")}</Label>
            <Input
              placeholder={t("descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>{t("amount")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                {group.currency}
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-14"
              />
            </div>
          </div>

          {/* Paid By */}
          <div className="space-y-2">
            <Label>{t("paidBy")}</Label>
            <select
              value={paidByMemberId}
              onChange={(e) => setPaidByMemberId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
            >
              {group.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.emoji} {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>{t("category")}</Label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all ${
                    category === cat.value
                      ? "border-purple-400 bg-purple-50 text-purple-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-600 hover:border-purple-200 hover:bg-purple-50/50"
                  }`}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="truncate w-full text-center">
                    {t(cat.labelKey)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Split Type */}
          <div className="space-y-2">
            <Label>{t("splitType")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSplitType("equal")}
                className={`px-4 py-2 rounded-xl border font-medium text-sm transition-all ${
                  splitType === "equal"
                    ? "border-purple-400 bg-purple-50 text-purple-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-purple-200"
                }`}
              >
                \u00f7 {t("equalSplit")}
              </button>
              <button
                type="button"
                onClick={() => setSplitType("exact")}
                className={`px-4 py-2 rounded-xl border font-medium text-sm transition-all ${
                  splitType === "exact"
                    ? "border-purple-400 bg-purple-50 text-purple-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-purple-200"
                }`}
              >
                \ud83d\udcdd {t("exactSplit")}
              </button>
            </div>
          </div>

          {/* Split Among */}
          <div className="space-y-2">
            <Label>{t("splitAmong")}</Label>
            <div className="space-y-2 rounded-xl border border-gray-200 p-3">
              {group.members.map((member) => {
                const isSelected = selectedMemberIds.has(member.id);
                return (
                  <div key={member.id} className="flex items-center gap-3">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleMember(member.id)}
                    />
                    <span className="text-base">
                      {member.emoji} {member.name}
                    </span>
                    {isSelected && splitType === "equal" && amount && (
                      <span className="ml-auto text-sm text-gray-400">
                        {group.currency} {equalAmount}
                      </span>
                    )}
                    {isSelected && splitType === "exact" && (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={exactAmounts[member.id] ?? ""}
                        onChange={(e) =>
                          setExactAmounts((prev) => ({
                            ...prev,
                            [member.id]: e.target.value,
                          }))
                        }
                        className="ml-auto w-28"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {validationError && (
              <p className="text-sm text-red-500">{validationError}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc("cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {isPending ? tc("saving") : tc("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
