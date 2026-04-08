import { createFactory } from "hono/factory";
import { DrizzleExpenseRepository } from "@repo/infrastructure";
import type { ExpensesGetContext } from "../generated/endpoints/expenses/expenses.context";
import type { AppEnv } from "../types/app-env";

const factory = createFactory<AppEnv>();

export const expensesGetHandlers = factory.createHandlers(
  async (c: ExpensesGetContext<AppEnv>) => {
    const db = c.get("db");
    const { expenseId } = c.req.param();

    const expenseRepo = new DrizzleExpenseRepository(db);
    const expense = await expenseRepo.findById(expenseId);

    if (!expense) {
      return c.json({ message: "Expense not found", code: "NOT_FOUND" }, 404);
    }

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
