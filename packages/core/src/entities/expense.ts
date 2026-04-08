import { BaseEntity } from "./base-entity";
import type { ExpenseSplit } from "./expense-split";

export type SplitType = "equal" | "exact";
export type ExpenseCategory =
  | "food"
  | "transport"
  | "accommodation"
  | "entertainment"
  | "shopping"
  | "utilities"
  | "other";

export class Expense extends BaseEntity<string> {
  constructor(
    public readonly id: string,
    public readonly groupId: string,
    public readonly description: string,
    public readonly amount: string,
    public readonly paidByMemberId: string,
    public readonly splitType: SplitType,
    public readonly category: ExpenseCategory,
    public readonly splits: ExpenseSplit[],
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {
    super(id);
  }

  static create(
    id: string,
    groupId: string,
    description: string,
    amount: string,
    paidByMemberId: string,
    splitType: SplitType,
    category: ExpenseCategory,
    splits: ExpenseSplit[]
  ): Expense {
    const now = new Date().toISOString();
    return new Expense(
      id,
      groupId,
      description,
      amount,
      paidByMemberId,
      splitType,
      category,
      splits,
      now,
      now
    );
  }

  update(updates: {
    description?: string;
    amount?: string;
    paidByMemberId?: string;
    splitType?: SplitType;
    category?: ExpenseCategory;
    splits?: ExpenseSplit[];
  }): Expense {
    return new Expense(
      this.id,
      this.groupId,
      updates.description ?? this.description,
      updates.amount ?? this.amount,
      updates.paidByMemberId ?? this.paidByMemberId,
      updates.splitType ?? this.splitType,
      updates.category ?? this.category,
      updates.splits ?? this.splits,
      this.createdAt,
      new Date().toISOString()
    );
  }
}
