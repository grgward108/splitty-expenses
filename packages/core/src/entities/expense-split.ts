import { BaseEntity } from "./base-entity";

export class ExpenseSplit extends BaseEntity<string> {
  constructor(
    public readonly id: string,
    public readonly expenseId: string,
    public readonly memberId: string,
    public readonly amount: string,
    public readonly createdAt: string
  ) {
    super(id);
  }

  static create(id: string, expenseId: string, memberId: string, amount: string): ExpenseSplit {
    return new ExpenseSplit(id, expenseId, memberId, amount, new Date().toISOString());
  }
}
