import { BaseEntity } from "./base-entity";

export class Group extends BaseEntity<string> {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly currency: string,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {
    super(id);
  }

  static create(id: string, name: string, currency: string): Group {
    const now = new Date().toISOString();
    return new Group(id, name, currency, now, now);
  }

  update(updates: { name?: string; currency?: string }): Group {
    return new Group(
      this.id,
      updates.name ?? this.name,
      updates.currency ?? this.currency,
      this.createdAt,
      new Date().toISOString()
    );
  }
}
