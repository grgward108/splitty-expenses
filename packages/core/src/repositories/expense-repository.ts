import type { Expense } from "../entities/expense";
import type { ExpenseSplit } from "../entities/expense-split";
import type { PaginatedResult, PaginationParams } from "../types";

export interface ExpenseRepository {
  findById(id: string): Promise<Expense | null>;
  findByGroupId(groupId: string, params?: PaginationParams): Promise<PaginatedResult<Expense>>;
  save(expense: Expense): Promise<Expense>;
  delete(id: string): Promise<void>;
  findSplitsByExpenseIds(expenseIds: string[]): Promise<ExpenseSplit[]>;
}
