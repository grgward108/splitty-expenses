import { createFactory } from "hono/factory";
import { DrizzleMemberRepository, DrizzleExpenseRepository } from "@repo/infrastructure";
import type { BalancesGetContext } from "../generated/endpoints/balances/balances.context";
import type { AppEnv } from "../types/app-env";

const factory = createFactory<AppEnv>();

export const balancesGetHandlers = factory.createHandlers(
  async (c: BalancesGetContext<AppEnv>) => {
    const db = c.get("db");
    const { groupId } = c.req.param();

    const memberRepo = new DrizzleMemberRepository(db);
    const expenseRepo = new DrizzleExpenseRepository(db);

    const memberList = await memberRepo.findByGroupId(groupId);
    const expenseResult = await expenseRepo.findByGroupId(groupId, { page: 1, limit: 10000 });

    // Calculate net balance per member
    // Positive = others owe you, Negative = you owe others
    const netBalance = new Map<string, number>();
    for (const m of memberList) {
      netBalance.set(m.id, 0);
    }

    for (const expense of expenseResult.items) {
      const paidAmount = parseFloat(expense.amount);
      netBalance.set(
        expense.paidByMemberId,
        (netBalance.get(expense.paidByMemberId) ?? 0) + paidAmount
      );

      for (const split of expense.splits) {
        const splitAmount = parseFloat(split.amount);
        netBalance.set(split.memberId, (netBalance.get(split.memberId) ?? 0) - splitAmount);
      }
    }

    const memberMap = new Map(memberList.map((m) => [m.id, m]));

    const balances = memberList.map((m) => ({
      memberId: m.id,
      memberName: m.name,
      memberEmoji: m.emoji,
      balance: (netBalance.get(m.id) ?? 0).toFixed(2),
    }));

    // Simplify debts: greedy match largest debtor with largest creditor
    const debtors: { id: string; amount: number }[] = [];
    const creditors: { id: string; amount: number }[] = [];

    for (const [memberId, balance] of netBalance) {
      if (balance < -0.01) {
        debtors.push({ id: memberId, amount: -balance });
      } else if (balance > 0.01) {
        creditors.push({ id: memberId, amount: balance });
      }
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const debts: {
      fromMemberId: string;
      fromMemberName: string;
      fromMemberEmoji: string;
      toMemberId: string;
      toMemberName: string;
      toMemberEmoji: string;
      amount: string;
    }[] = [];

    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const transfer = Math.min(debtors[i].amount, creditors[j].amount);
      if (transfer > 0.01) {
        const from = memberMap.get(debtors[i].id)!;
        const to = memberMap.get(creditors[j].id)!;
        debts.push({
          fromMemberId: from.id,
          fromMemberName: from.name,
          fromMemberEmoji: from.emoji,
          toMemberId: to.id,
          toMemberName: to.name,
          toMemberEmoji: to.emoji,
          amount: transfer.toFixed(2),
        });
      }
      debtors[i].amount -= transfer;
      creditors[j].amount -= transfer;
      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }

    return c.json({ balances, debts });
  }
);
