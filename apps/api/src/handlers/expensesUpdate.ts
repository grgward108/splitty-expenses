import { createFactory } from "hono/factory";
import { ExpenseSplit } from "@repo/core";
import { DrizzleExpenseRepository } from "@repo/infrastructure";
import type { ExpensesUpdateContext } from "../generated/endpoints/expenses/expenses.context";
import type { AppEnv } from "../types/app-env";

const factory = createFactory<AppEnv>();

export const expensesUpdateHandlers = factory.createHandlers(
  async (c: ExpensesUpdateContext<AppEnv>) => {
    const db = c.get("db");
    const { expenseId } = c.req.param();
    const body = await c.req.json();

    const expenseRepo = new DrizzleExpenseRepository(db);
    const existing = await expenseRepo.findById(expenseId);

    if (!existing) {
      return c.json({ message: "Expense not found", code: "NOT_FOUND" }, 404);
    }

    const newSplits = body.splits
      ? body.splits.map((s: { memberId: string; amount: string }) =>
          ExpenseSplit.create(crypto.randomUUID(), expenseId, s.memberId, s.amount)
        )
      : undefined;

    const updated = existing.update({
      description: body.description,
      amount: body.amount,
      paidByMemberId: body.paidByMemberId,
      splitType: body.splitType,
      category: body.category,
      splits: newSplits,
    });

    await expenseRepo.save(updated);

    return c.json({
      id: updated.id,
      groupId: updated.groupId,
      description: updated.description,
      amount: updated.amount,
      paidByMemberId: updated.paidByMemberId,
      splitType: updated.splitType,
      category: updated.category,
      splits: updated.splits.map((s) => ({
        id: s.id,
        expenseId: s.expenseId,
        memberId: s.memberId,
        amount: s.amount,
        createdAt: s.createdAt,
      })),
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }
);
