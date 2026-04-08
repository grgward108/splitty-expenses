import { eq, desc, sql } from "drizzle-orm";
import { Expense, ExpenseSplit } from "@repo/core";
import type { ExpenseRepository } from "@repo/core";
import type { PaginatedResult, PaginationParams } from "@repo/core";
import type { DrizzleDatabase } from "../database";
import { expenses, expenseSplits } from "../database/schema";

export class DrizzleExpenseRepository implements ExpenseRepository {
  constructor(private db: DrizzleDatabase) {}

  async findById(id: string): Promise<Expense | null> {
    const rows = await this.db.select().from(expenses).where(eq(expenses.id, id)).limit(1);
    if (rows.length === 0) return null;

    const splitRows = await this.db
      .select()
      .from(expenseSplits)
      .where(eq(expenseSplits.expenseId, id));

    const r = rows[0];
    return new Expense(
      r.id,
      r.groupId,
      r.description,
      r.amount,
      r.paidByMemberId,
      r.splitType,
      r.category,
      splitRows.map((s) => new ExpenseSplit(s.id, s.expenseId, s.memberId, s.amount, s.createdAt)),
      r.createdAt,
      r.updatedAt
    );
  }

  async findByGroupId(
    groupId: string,
    params?: PaginationParams
  ): Promise<PaginatedResult<Expense>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const offset = (page - 1) * limit;

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(expenses)
      .where(eq(expenses.groupId, groupId));

    const total = Number(countResult.count);

    const expenseRows = await this.db
      .select()
      .from(expenses)
      .where(eq(expenses.groupId, groupId))
      .orderBy(desc(expenses.createdAt))
      .limit(limit)
      .offset(offset);

    const expenseIds = expenseRows.map((e) => e.id);
    const splitRows = await this.findSplitsByExpenseIds(expenseIds);

    const splitsByExpense = new Map<string, ExpenseSplit[]>();
    for (const s of splitRows) {
      const existing = splitsByExpense.get(s.expenseId) ?? [];
      existing.push(s);
      splitsByExpense.set(s.expenseId, existing);
    }

    const items = expenseRows.map(
      (r) =>
        new Expense(
          r.id,
          r.groupId,
          r.description,
          r.amount,
          r.paidByMemberId,
          r.splitType,
          r.category,
          splitsByExpense.get(r.id) ?? [],
          r.createdAt,
          r.updatedAt
        )
    );

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async save(expense: Expense): Promise<Expense> {
    await this.db
      .insert(expenses)
      .values({
        id: expense.id,
        groupId: expense.groupId,
        description: expense.description,
        amount: expense.amount,
        paidByMemberId: expense.paidByMemberId,
        splitType: expense.splitType,
        category: expense.category,
        createdAt: expense.createdAt,
        updatedAt: expense.updatedAt,
      })
      .onConflictDoUpdate({
        target: expenses.id,
        set: {
          description: expense.description,
          amount: expense.amount,
          paidByMemberId: expense.paidByMemberId,
          splitType: expense.splitType,
          category: expense.category,
          updatedAt: expense.updatedAt,
        },
      });

    // Replace splits
    await this.db.delete(expenseSplits).where(eq(expenseSplits.expenseId, expense.id));
    if (expense.splits.length > 0) {
      await this.db.insert(expenseSplits).values(
        expense.splits.map((s) => ({
          id: s.id,
          expenseId: s.expenseId,
          memberId: s.memberId,
          amount: s.amount,
          createdAt: s.createdAt,
        }))
      );
    }

    return expense;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(expenses).where(eq(expenses.id, id));
  }

  async findSplitsByExpenseIds(expenseIds: string[]): Promise<ExpenseSplit[]> {
    if (expenseIds.length === 0) return [];
    const rows = await this.db
      .select()
      .from(expenseSplits)
      .where(sql`${expenseSplits.expenseId} IN ${expenseIds}`);
    return rows.map(
      (s) => new ExpenseSplit(s.id, s.expenseId, s.memberId, s.amount, s.createdAt)
    );
  }
}
