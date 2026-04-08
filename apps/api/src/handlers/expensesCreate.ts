import { createFactory } from "hono/factory";
import { Expense, ExpenseSplit } from "@repo/core";
import { DrizzleGroupRepository, DrizzleExpenseRepository } from "@repo/infrastructure";
import type { ExpensesCreateContext } from "../generated/endpoints/expenses/expenses.context";
import type { AppEnv } from "../types/app-env";

const factory = createFactory<AppEnv>();

export const expensesCreateHandlers = factory.createHandlers(
  async (c: ExpensesCreateContext<AppEnv>) => {
    const db = c.get("db");
    const { groupId } = c.req.param();
    const body = await c.req.json();

    const groupRepo = new DrizzleGroupRepository(db);
    const group = await groupRepo.findById(groupId);
    if (!group) {
      return c.json({ message: "Group not found", code: "NOT_FOUND" }, 404);
    }

    const expenseId = crypto.randomUUID();
    const splits = body.splits.map((s: { memberId: string; amount: string }) =>
      ExpenseSplit.create(crypto.randomUUID(), expenseId, s.memberId, s.amount)
    );

    const expense = Expense.create(
      expenseId,
      groupId,
      body.description,
      body.amount,
      body.paidByMemberId,
      body.splitType,
      body.category ?? "other",
      splits
    );

    const expenseRepo = new DrizzleExpenseRepository(db);
    await expenseRepo.save(expense);

    return c.json({
      id: expense.id,
      groupId: expense.groupId,
      description: expense.description,
      amount: expense.amount,
      paidByMemberId: expense.paidByMemberId,
      splitType: expense.splitType,
      category: expense.category,
      splits: expense.splits.map((s) => ({
        id: s.id,
        expenseId: s.expenseId,
        memberId: s.memberId,
        amount: s.amount,
        createdAt: s.createdAt,
      })),
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    });
  }
);
