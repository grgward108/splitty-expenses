import { BaseEntity } from "./base-entity";

export class Member extends BaseEntity<string> {
  constructor(
    public readonly id: string,
    public readonly groupId: string,
    public readonly name: string,
    public readonly emoji: string,
    public readonly createdAt: string
  ) {
    super(id);
  }

  static create(id: string, groupId: string, name: string, emoji: string): Member {
    return new Member(id, groupId, name, emoji, new Date().toISOString());
  }

  update(updates: { name?: string; emoji?: string }): Member {
    return new Member(
      this.id,
      this.groupId,
      updates.name ?? this.name,
      updates.emoji ?? this.emoji,
      this.createdAt
    );
  }
}
