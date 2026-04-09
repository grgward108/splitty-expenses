import { useTranslation } from "@repo/i18n";
import { useBalancesGet } from "@repo/spec/client/balances/balances";
import type { BalanceSummary as BalanceSummaryType, Balance, Debt } from "@repo/spec/client/model";

interface BalanceSummaryProps { groupId: string; currency: string; }

export function BalanceSummary({ groupId, currency }: BalanceSummaryProps) {
  const { t } = useTranslation("balances");
  const balancesQuery = useBalancesGet(groupId);

  const formatAmount = (amount: string) => {
    const num = Number.parseFloat(amount);
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(Math.abs(num));
  };

  if (balancesQuery.isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-16 animate-pulse" style={{ border: "var(--border)" }} />)}
      </div>
    );
  }

  const data = balancesQuery.data?.data;
  if (!data || !("balances" in data)) return null;
  const summary = data as BalanceSummaryType;
  const { balances, debts } = summary;

  return (
    <div className="space-y-8">
      {/* Net balances */}
      <div>
        <div className="inline-block px-3 py-1 mb-3" style={{ background: "var(--cyan)", border: "2px solid var(--black)", transform: "rotate(-1deg)" }}>
          <span className="font-display text-xs">{t("netBalance")}</span>
        </div>
        <div className="brutal-card overflow-hidden">
          {balances.map((balance: Balance, i: number) => {
            const num = Number.parseFloat(balance.balance);
            const isPositive = num > 0.01;
            const isNegative = num < -0.01;

            return (
              <div key={balance.memberId} className="flex items-center gap-3 p-4" style={{ borderBottom: i < balances.length - 1 ? "3px dashed var(--black)" : "none" }}>
                <span className="text-2xl">{balance.memberEmoji}</span>
                <span className="font-bold flex-1">{balance.memberName}</span>
                <span
                  className="font-display text-lg"
                  style={{ color: isPositive ? "green" : isNegative ? "var(--red)" : "#999" }}
                >
                  {isPositive ? "+" : ""}{formatAmount(balance.balance)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simplified debts */}
      <div>
        <div className="inline-block px-3 py-1 mb-3" style={{ background: "var(--pink)", border: "2px solid var(--black)", transform: "rotate(1deg)" }}>
          <span className="font-display text-xs">{t("simplifiedDebts")}</span>
        </div>

        {debts.length === 0 ? (
          <div className="brutal-card p-8 text-center" style={{ background: "var(--lime)" }}>
            <div className="font-display text-3xl mb-2">{"\u2714"} ALL GOOD</div>
            <p className="font-bold">{t("allSettled")}</p>
          </div>
        ) : (
          <div className="space-y-3 stagger">
            {debts.map((debt: Debt, index: number) => (
              <div key={index} className="brutal-card p-4 flex items-center gap-2 flex-wrap">
                <span className="text-xl">{debt.fromMemberEmoji}</span>
                <span className="font-bold text-sm">{debt.fromMemberName}</span>
                <div className="flex items-center gap-1 mx-1">
                  <div className="w-6 h-[3px]" style={{ background: "var(--red)" }} />
                  <div className="font-display text-sm" style={{ color: "var(--red)" }}>{"\u25b6"}</div>
                </div>
                <span className="text-xl">{debt.toMemberEmoji}</span>
                <span className="font-bold text-sm">{debt.toMemberName}</span>
                <div className="ml-auto px-2 py-1" style={{ background: "var(--yellow)", border: "2px solid var(--black)" }}>
                  <span className="font-display text-sm">{formatAmount(debt.amount)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
