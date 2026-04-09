import { useTranslation } from "@repo/i18n";
import { useExpensesCreate, useExpensesGet, useExpensesUpdate, getExpensesListQueryKey } from "@repo/spec/client/expenses/expenses";
import { getBalancesGetQueryKey } from "@repo/spec/client/balances/balances";
import type { Group, ExpenseCategory, CreateExpenseSplitInput, Member } from "@repo/spec/client/model";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";

const CATEGORIES: { value: ExpenseCategory; emoji: string; labelKey: string; color: string }[] = [
  { value: "food", emoji: "\ud83c\udf54", labelKey: "food", color: "var(--yellow)" },
  { value: "transport", emoji: "\ud83d\ude97", labelKey: "transport", color: "var(--cyan)" },
  { value: "accommodation", emoji: "\ud83c\udfe8", labelKey: "accommodation", color: "var(--lavender)" },
  { value: "entertainment", emoji: "\ud83c\udfae", labelKey: "entertainment", color: "var(--lime)" },
  { value: "shopping", emoji: "\ud83d\udecd\ufe0f", labelKey: "shopping", color: "var(--pink)" },
  { value: "utilities", emoji: "\ud83d\udca1", labelKey: "utilities", color: "var(--yellow)" },
  { value: "other", emoji: "\ud83d\udce6", labelKey: "other", color: "var(--cyan)" },
];

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  group: Group;
  expenseId: string | null;
}

export function ExpenseFormDialog({ open, onOpenChange, groupId, group, expenseId }: ExpenseFormDialogProps) {
  const { t } = useTranslation("expenses");
  const { t: tc } = useTranslation("common");
  const queryClient = useQueryClient();
  const createExpense = useExpensesCreate();
  const updateExpense = useExpensesUpdate();
  const isEditing = !!expenseId;
  const expenseQuery = useExpensesGet(groupId, expenseId ?? "", { query: { enabled: isEditing && open } });

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
        setDescription(expense.description); setAmount(expense.amount); setPaidByMemberId(expense.paidByMemberId);
        setSplitType(expense.splitType); setCategory(expense.category);
        setSelectedMemberIds(new Set(expense.splits.map((s: { memberId: string }) => s.memberId)));
        const amounts: Record<string, string> = {};
        for (const s of expense.splits) amounts[s.memberId] = s.amount;
        setExactAmounts(amounts);
      }
    } else if (!isEditing) {
      setDescription(""); setAmount(""); setPaidByMemberId(group.members[0]?.id ?? "");
      setSplitType("equal"); setCategory("other");
      setSelectedMemberIds(new Set(group.members.map((m: Member) => m.id)));
      setExactAmounts({});
    }
    setValidationError("");
  }, [open, isEditing, expenseQuery.data, group.members]);

  const selectedMembers = group.members.filter((m: Member) => selectedMemberIds.has(m.id));

  const equalAmount = useMemo(() => {
    if (selectedMembers.length === 0 || !amount) return "0.00";
    const total = Number.parseFloat(amount);
    return Number.isNaN(total) ? "0.00" : (total / selectedMembers.length).toFixed(2);
  }, [amount, selectedMembers.length]);

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds((prev) => { const next = new Set(prev); next.has(memberId) ? next.delete(memberId) : next.add(memberId); return next; });
  };

  const handleSubmit = () => {
    if (!description.trim() || !amount || !paidByMemberId || selectedMembers.length === 0) return;
    if (splitType === "exact") {
      const total = Number.parseFloat(amount);
      const splitTotal = selectedMembers.reduce((sum: number, m: Member) => sum + Number.parseFloat(exactAmounts[m.id] ?? "0"), 0);
      if (Math.abs(total - splitTotal) > 0.01) { setValidationError(t("splitMismatch")); return; }
    }
    setValidationError("");

    const splits: CreateExpenseSplitInput[] = splitType === "equal"
      ? selectedMembers.map((m: Member) => ({ memberId: m.id, amount: equalAmount }))
      : selectedMembers.map((m: Member) => ({ memberId: m.id, amount: exactAmounts[m.id] ?? "0" }));

    const data = { description: description.trim(), amount, paidByMemberId, splitType, category, splits };
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: getExpensesListQueryKey(groupId) });
      queryClient.invalidateQueries({ queryKey: getBalancesGetQueryKey(groupId) });
      onOpenChange(false);
    };

    if (isEditing && expenseId) updateExpense.mutate({ groupId, expenseId, data }, { onSuccess });
    else createExpense.mutate({ groupId, data }, { onSuccess });
  };

  const isPending = createExpense.isPending || updateExpense.isPending;
  const canSubmit = description.trim() && amount && paidByMemberId && selectedMembers.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" style={{ borderRadius: 0, border: "var(--border)", boxShadow: "var(--shadow)" }}>
        <DialogHeader>
          <DialogTitle>
            <span className="font-display text-xl">{isEditing ? t("editExpense") : t("addExpense")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Description */}
          <div>
            <label className="font-display text-xs block mb-1.5">{t("description")}</label>
            <input className="input-brutal" placeholder={t("descriptionPlaceholder")} value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} />
          </div>

          {/* Amount */}
          <div>
            <label className="font-display text-xs block mb-1.5">{t("amount")}</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: "#999" }}>{group.currency}</span>
              <input type="number" step="0.01" min="0" className="input-brutal pl-14" placeholder="0.00" value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
            </div>
          </div>

          {/* Paid By */}
          <div>
            <label className="font-display text-xs block mb-1.5">{t("paidBy")}</label>
            <div className="flex flex-wrap gap-2">
              {group.members.map((m: Member) => (
                <button key={m.id} type="button" onClick={() => setPaidByMemberId(m.id)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all"
                  style={{
                    border: "2px solid var(--black)",
                    background: paidByMemberId === m.id ? "var(--black)" : "var(--white)",
                    color: paidByMemberId === m.id ? "var(--white)" : "var(--black)",
                    boxShadow: paidByMemberId === m.id ? "none" : "2px 2px 0 var(--black)",
                    transform: paidByMemberId === m.id ? "translate(2px,2px)" : "none",
                  }}
                >
                  {m.emoji} {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="font-display text-xs block mb-1.5">{t("category")}</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat.value} type="button" onClick={() => setCategory(cat.value)}
                  className="flex flex-col items-center gap-1 p-2 text-xs font-bold transition-all"
                  style={{
                    border: "2px solid var(--black)",
                    background: category === cat.value ? cat.color : "var(--white)",
                    boxShadow: category === cat.value ? "none" : "2px 2px 0 var(--black)",
                    transform: category === cat.value ? "translate(2px,2px)" : "none",
                  }}
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <span className="truncate w-full text-center" style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.625rem" }}>{t(cat.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Split Type */}
          <div>
            <label className="font-display text-xs block mb-1.5">{t("splitType")}</label>
            <div className="flex gap-0">
              {(["equal", "exact"] as const).map((type) => (
                <button key={type} type="button" onClick={() => setSplitType(type)}
                  className={`flex-1 tab-brutal ${splitType === type ? "active" : ""}`}
                >
                  {type === "equal" ? t("equalSplit") : t("exactSplit")}
                </button>
              ))}
            </div>
          </div>

          {/* Split Among */}
          <div>
            <label className="font-display text-xs block mb-1.5">{t("splitAmong")}</label>
            <div style={{ border: "var(--border)" }}>
              {group.members.map((member: Member, i: number) => {
                const isSelected = selectedMemberIds.has(member.id);
                return (
                  <div key={member.id} className="flex items-center gap-3 px-3 py-2.5"
                    style={{
                      borderBottom: i < group.members.length - 1 ? "2px dashed var(--black)" : "none",
                      background: isSelected ? "var(--lime)" : "var(--white)",
                      opacity: isSelected ? 1 : 0.5,
                    }}
                  >
                    <button type="button" onClick={() => toggleMember(member.id)}
                      className="w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ border: "2px solid var(--black)", background: isSelected ? "var(--black)" : "var(--white)", color: isSelected ? "var(--white)" : "var(--black)" }}
                    >
                      {isSelected ? "\u2713" : ""}
                    </button>
                    <span className="text-base">{member.emoji}</span>
                    <span className="font-bold text-sm flex-1">{member.name}</span>
                    {isSelected && splitType === "equal" && amount && (
                      <span className="text-xs font-bold" style={{ color: "#666" }}>{group.currency} {equalAmount}</span>
                    )}
                    {isSelected && splitType === "exact" && (
                      <input type="number" step="0.01" min="0" placeholder="0.00"
                        className="input-brutal w-24 text-right text-sm" style={{ height: "32px", padding: "0 8px" }}
                        value={exactAmounts[member.id] ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExactAmounts((prev) => ({ ...prev, [member.id]: e.target.value }))} />
                    )}
                  </div>
                );
              })}
            </div>
            {validationError && (
              <div className="mt-2 px-3 py-1 text-xs font-bold" style={{ background: "var(--red)", color: "var(--white)", border: "2px solid var(--black)" }}>
                {validationError}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <button onClick={() => onOpenChange(false)} className="btn-brutal-outline">{tc("cancel")}</button>
          <button onClick={handleSubmit} disabled={!canSubmit || isPending} className="btn-brutal">
            {isPending ? tc("saving") : tc("save")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
