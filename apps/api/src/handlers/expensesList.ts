import { createFactory } from "hono/factory";
import { DrizzleExpenseRepository } from "@repo/infrastructure";
import type { ExpensesListContext } from "../generated/endpoints/expenses/expenses.context";
import type { AppEnv } from "../types/app-env";

const factory = createFactory<AppEnv>();

export const expensesListHandlers = factory.createHandlers(
  async (c: ExpensesListContext<AppEnv>) => {
    const db = c.get("db");
    const { groupId } = c.req.param();
    const page = Number(c.req.query("page") ?? 1);
    const limit = Number(c.req.query("limit") ?? 10);

    const expenseRepo = new DrizzleExpenseRepository(db);
    const result = await expenseRepo.findByGroupId(groupId, { page, limit });

    return c.json({
      items: result.items.map((e) => ({
        id: e.id,
        groupId: e.groupId,
        description: e.description,
        amount: e.amount,
        paidByMemberId: e.paidByMemberId,
        splitType: e.splitType,
        category: e.category,
        splits: e.splits.map((s) => ({
          id: s.id,
          expenseId: s.expenseId,
          memberId: s.memberId,
          amount: s.amount,
          createdAt: s.createdAt,
        })),
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }
);
