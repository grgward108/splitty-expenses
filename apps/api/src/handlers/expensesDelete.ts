import { createFactory } from "hono/factory";
import { DrizzleExpenseRepository } from "@repo/infrastructure";
import type { ExpensesDeleteContext } from "../generated/endpoints/expenses/expenses.context";
import type { AppEnv } from "../types/app-env";

const factory = createFactory<AppEnv>();

export const expensesDeleteHandlers = factory.createHandlers(
  async (c: ExpensesDeleteContext<AppEnv>) => {
    const db = c.get("db");
    const { expenseId } = c.req.param();

    const expenseRepo = new DrizzleExpenseRepository(db);
    const existing = await expenseRepo.findById(expenseId);

    if (!existing) {
      return c.json({ message: "Expense not found", code: "NOT_FOUND" }, 404);
    }

    await expenseRepo.delete(expenseId);
    return c.body(null, 204);
  }
);
