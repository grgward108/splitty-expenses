import { useTranslation } from "@repo/i18n";
import { useBalancesGet } from "@repo/spec/client/balances/balances";
import type { BalanceSummary as BalanceSummaryType } from "@repo/spec/client/model";
import { Card, CardContent } from "@repo/ui";

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
          <div
            key={i}
            className="h-16 rounded-xl bg-white/60 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const data = balancesQuery.data?.data;
  if (!data || !("balances" in data)) {
    return null;
  }

  const summary = data as BalanceSummaryType;
  const { balances, debts } = summary;

  const allSettled = debts.length === 0;

  return (
    <div className="space-y-6">
      {/* Per-member balances */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {t("netBalance")}
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {balances.map((balance) => {
            const num = Number.parseFloat(balance.balance);
            const isPositive = num > 0;
            const isZero = Math.abs(num) < 0.01;

            return (
              <Card
                key={balance.memberId}
                className="border-0 shadow-sm bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-2xl">{balance.memberEmoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {balance.memberName}
                    </p>
                  </div>
                  <span
                    className={`font-bold text-lg ${
                      isZero
                        ? "text-gray-400"
                        : isPositive
                          ? "text-emerald-600"
                          : "text-red-500"
                    }`}
                  >
                    {isZero
                      ? formatAmount("0")
                      : isPositive
                        ? `+${formatAmount(balance.balance)}`
                        : `-${formatAmount(balance.balance)}`}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Simplified Debts */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {t("simplifiedDebts")}
        </h3>

        {allSettled ? (
          <div className="text-center py-8">
            <span className="text-5xl mb-3 block">\u2705</span>
            <p className="text-lg font-medium text-emerald-600">
              {t("allSettled")}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {debts.map((debt, index) => (
              <Card
                key={index}
                className="border-0 shadow-sm bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">{debt.fromMemberEmoji}</span>
                    <span className="font-medium text-gray-900">
                      {debt.fromMemberName}
                    </span>
                    <span className="text-gray-400 mx-1">\u2192</span>
                    <span className="text-xl">{debt.toMemberEmoji}</span>
                    <span className="font-medium text-gray-900">
                      {debt.toMemberName}
                    </span>
                    <span className="ml-auto font-bold text-orange-600">
                      {formatAmount(debt.amount)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
