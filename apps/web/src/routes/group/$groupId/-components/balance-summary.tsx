import { useTranslation } from "@repo/i18n";
import { useBalancesGet } from "@repo/spec/client/balances/balances";
import type { BalanceSummary as BalanceSummaryType, Balance, Debt } from "@repo/spec/client/model";

interface BalanceSummaryProps {
  groupId: string;
  currency: string;
}

export function BalanceSummary({ groupId, currency }: BalanceSummaryProps) {
  const { t } = useTranslation("balances");
  const balancesQuery = useBalancesGet(groupId);

  const formatAmount = (amount: string) => {
    const num = Number.parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(Math.abs(num));
  };

  if (balancesQuery.isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "var(--color-border)" }} />
        ))}
      </div>
    );
  }

  const data = balancesQuery.data?.data;
  if (!data || !("balances" in data)) return null;

  const summary = data as BalanceSummaryType;
  const { balances, debts } = summary;
  const allSettled = debts.length === 0;

  return (
    <div className="space-y-8">
      {/* Per-member balances */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
          {t("netBalance")}
        </h3>
        <div className="card-surface overflow-hidden">
          {balances.map((balance: Balance, i: number) => {
            const num = Number.parseFloat(balance.balance);
            const isPositive = num > 0.01;
            const isNegative = num < -0.01;

            return (
              <div
                key={balance.memberId}
                className="flex items-center gap-3 p-4"
                style={{ borderBottom: i < balances.length - 1 ? "1px solid var(--color-border)" : "none" }}
              >
                <span className="text-2xl">{balance.memberEmoji}</span>
                <span className="font-medium flex-1" style={{ color: "var(--color-charcoal)" }}>
                  {balance.memberName}
                </span>
                <span className={`text-lg font-bold tabular-nums ${isPositive ? "amount-positive" : isNegative ? "amount-negative" : ""}`}
                  style={!isPositive && !isNegative ? { color: "var(--color-muted)" } : {}}
                >
                  {isPositive ? "+" : ""}{formatAmount(balance.balance)}
                  {isNegative && <span className="text-xs font-normal ml-1" style={{ color: "var(--color-muted)" }}>owes</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simplified Debts */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-muted)" }}>
          {t("simplifiedDebts")}
        </h3>

        {allSettled ? (
          <div
            className="text-center py-10 rounded-2xl"
            style={{ background: "var(--color-sage-light)" }}
          >
            <div className="text-4xl mb-2">{"\u2705"}</div>
            <p className="text-lg font-semibold" style={{ color: "var(--color-sage)" }}>
              {t("allSettled")}
            </p>
          </div>
        ) : (
          <div className="space-y-2 stagger-children">
            {debts.map((debt: Debt, index: number) => (
              <div
                key={index}
                className="card-surface p-4 flex items-center gap-3"
              >
                {/* From */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl">{debt.fromMemberEmoji}</span>
                  <span className="font-medium truncate text-sm" style={{ color: "var(--color-charcoal)" }}>
                    {debt.fromMemberName}
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-8 h-[2px] rounded" style={{ background: "var(--color-amber)" }} />
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                    style={{ color: "var(--color-amber)" }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>

                {/* To */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xl">{debt.toMemberEmoji}</span>
                  <span className="font-medium truncate text-sm" style={{ color: "var(--color-charcoal)" }}>
                    {debt.toMemberName}
                  </span>
                </div>

                {/* Amount */}
                <span className="ml-auto font-bold text-lg tabular-nums whitespace-nowrap" style={{ color: "var(--color-amber)" }}>
                  {formatAmount(debt.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
