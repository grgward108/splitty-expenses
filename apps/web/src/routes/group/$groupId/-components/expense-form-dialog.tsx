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
  Member,
} from "@repo/spec/client/model";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";

const CATEGORIES: { value: ExpenseCategory; emoji: string; labelKey: string; bg: string }[] = [
  { value: "food", emoji: "\ud83c\udf54", labelKey: "food", bg: "#fff3e0" },
  { value: "transport", emoji: "\ud83d\ude97", labelKey: "transport", bg: "#e3f2fd" },
  { value: "accommodation", emoji: "\ud83c\udfe8", labelKey: "accommodation", bg: "#f3e5f5" },
  { value: "entertainment", emoji: "\ud83c\udfae", labelKey: "entertainment", bg: "#e8f5e9" },
  { value: "shopping", emoji: "\ud83d\udecd\ufe0f", labelKey: "shopping", bg: "#fce4ec" },
  { value: "utilities", emoji: "\ud83d\udca1", labelKey: "utilities", bg: "#fff8e1" },
  { value: "other", emoji: "\ud83d\udce6", labelKey: "other", bg: "#f5f5f5" },
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
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState("");

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
        setSelectedMemberIds(new Set(expense.splits.map((s: { memberId: string }) => s.memberId)));
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
      setSelectedMemberIds(new Set(group.members.map((m: Member) => m.id)));
      setExactAmounts({});
    }
    setValidationError("");
  }, [open, isEditing, expenseQuery.data, group.members]);

  const selectedMembers = group.members.filter((m: Member) => selectedMemberIds.has(m.id));

  const equalAmount = useMemo(() => {
    if (selectedMembers.length === 0 || !amount) return "0.00";
    const total = Number.parseFloat(amount);
    if (Number.isNaN(total)) return "0.00";
    return (total / selectedMembers.length).toFixed(2);
  }, [amount, selectedMembers.length]);

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
  };

  const buildSplits = (): CreateExpenseSplitInput[] => {
    if (splitType === "equal") {
      return selectedMembers.map((m: Member) => ({ memberId: m.id, amount: equalAmount }));
    }
    return selectedMembers.map((m: Member) => ({ memberId: m.id, amount: exactAmounts[m.id] ?? "0" }));
  };

  const validateSplits = (): boolean => {
    if (selectedMembers.length === 0) return false;
    if (splitType === "exact") {
      const total = Number.parseFloat(amount);
      const splitTotal = selectedMembers.reduce(
        (sum: number, m: Member) => sum + Number.parseFloat(exactAmounts[m.id] ?? "0"), 0
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
      queryClient.invalidateQueries({ queryKey: getExpensesListQueryKey(groupId) });
      queryClient.invalidateQueries({ queryKey: getBalancesGetQueryKey(groupId) });
      onOpenChange(false);
    };

    if (isEditing && expenseId) {
      updateExpense.mutate({ groupId, expenseId, data }, { onSuccess });
    } else {
      createExpense.mutate({ groupId, data }, { onSuccess });
    }
  };

  const isPending = createExpense.isPending || updateExpense.isPending;
  const canSubmit = description.trim() && amount && paidByMemberId && selectedMembers.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto rounded-2xl" style={{ background: "var(--color-warm-white)" }}>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl italic" style={{ color: "var(--color-charcoal)" }}>
            {isEditing ? t("editExpense") : t("addExpense")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-charcoal)" }}>
              {t("description")}
            </label>
            <input
              className="input-field"
              placeholder={t("descriptionPlaceholder")}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-charcoal)" }}>
              {t("amount")}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: "var(--color-muted)" }}>
                {group.currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="input-field pl-14"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-charcoal)" }}>
              {t("paidBy")}
            </label>
            <div className="flex flex-wrap gap-2">
              {group.members.map((m: Member) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaidByMemberId(m.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: paidByMemberId === m.id ? "var(--color-charcoal)" : "transparent",
                    color: paidByMemberId === m.id ? "white" : "var(--color-charcoal)",
                    border: `1.5px solid ${paidByMemberId === m.id ? "var(--color-charcoal)" : "var(--color-border)"}`,
                  }}
                >
                  <span className="text-base">{m.emoji}</span> {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-charcoal)" }}>
              {t("category")}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: category === cat.value ? cat.bg : "transparent",
                    border: `1.5px solid ${category === cat.value ? "rgba(0,0,0,0.1)" : "var(--color-border)"}`,
                    color: "var(--color-charcoal)",
                    transform: category === cat.value ? "scale(1.02)" : "scale(1)",
                  }}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="truncate w-full text-center">{t(cat.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Split Type */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-charcoal)" }}>
              {t("splitType")}
            </label>
            <div className="flex p-1 rounded-xl" style={{ background: "rgba(0,0,0,0.04)" }}>
              <button
                type="button"
                onClick={() => setSplitType("equal")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${splitType === "equal" ? "tab-active" : ""}`}
                style={splitType !== "equal" ? { color: "var(--color-muted)" } : {}}
              >
                {t("equalSplit")}
              </button>
              <button
                type="button"
                onClick={() => setSplitType("exact")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${splitType === "exact" ? "tab-active" : ""}`}
                style={splitType !== "exact" ? { color: "var(--color-muted)" } : {}}
              >
                {t("exactSplit")}
              </button>
            </div>
          </div>

          {/* Split Among */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--color-charcoal)" }}>
              {t("splitAmong")}
            </label>
            <div className="rounded-xl overflow-hidden" style={{ border: "1.5px solid var(--color-border)" }}>
              {group.members.map((member: Member, i: number) => {
                const isSelected = selectedMemberIds.has(member.id);
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors"
                    style={{
                      borderBottom: i < group.members.length - 1 ? "1px solid var(--color-border)" : "none",
                      background: isSelected ? "rgba(0,0,0,0.02)" : "transparent",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleMember(member.id)}
                      className="w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0"
                      style={{
                        background: isSelected ? "var(--color-charcoal)" : "transparent",
                        border: `2px solid ${isSelected ? "var(--color-charcoal)" : "var(--color-border)"}`,
                      }}
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <span className="text-base">{member.emoji}</span>
                    <span className="font-medium text-sm flex-1" style={{ color: isSelected ? "var(--color-charcoal)" : "var(--color-muted)" }}>
                      {member.name}
                    </span>
                    {isSelected && splitType === "equal" && amount && (
                      <span className="text-sm tabular-nums" style={{ color: "var(--color-muted)" }}>
                        {group.currency} {equalAmount}
                      </span>
                    )}
                    {isSelected && splitType === "exact" && (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="input-field w-24 text-right text-sm"
                        style={{ height: "32px", padding: "0 8px" }}
                        value={exactAmounts[member.id] ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setExactAmounts((prev) => ({ ...prev, [member.id]: e.target.value }))
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {validationError && (
              <p className="text-sm mt-1.5" style={{ color: "var(--color-coral)" }}>{validationError}</p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <button onClick={() => onOpenChange(false)} className="btn-secondary">
            {tc("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className="btn-primary"
          >
            {isPending ? tc("saving") : tc("save")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
