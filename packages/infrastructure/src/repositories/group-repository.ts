import { eq } from "drizzle-orm";
import { Group, Member } from "@repo/core";
import type { GroupRepository } from "@repo/core";
import type { DrizzleDatabase } from "../database";
import { groups, members } from "../database/schema";

export class DrizzleGroupRepository implements GroupRepository {
  constructor(private db: DrizzleDatabase) {}

  async findById(id: string): Promise<Group | null> {
    const rows = await this.db.select().from(groups).where(eq(groups.id, id)).limit(1);
    if (rows.length === 0) return null;
    const r = rows[0];
    return new Group(r.id, r.name, r.currency, r.createdAt, r.updatedAt);
  }

  async findByIdWithMembers(id: string): Promise<{ group: Group; members: Member[] } | null> {
    const groupRows = await this.db.select().from(groups).where(eq(groups.id, id)).limit(1);
    if (groupRows.length === 0) return null;

    const memberRows = await this.db.select().from(members).where(eq(members.groupId, id));

    const g = groupRows[0];
    return {
      group: new Group(g.id, g.name, g.currency, g.createdAt, g.updatedAt),
      members: memberRows.map(
        (m) => new Member(m.id, m.groupId, m.name, m.emoji, m.createdAt)
      ),
    };
  }

  async save(group: Group): Promise<Group> {
    await this.db
      .insert(groups)
      .values({
        id: group.id,
        name: group.name,
        currency: group.currency,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt,
      })
      .onConflictDoUpdate({
        target: groups.id,
        set: {
          name: group.name,
          currency: group.currency,
          updatedAt: group.updatedAt,
        },
      });
    return group;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(groups).where(eq(groups.id, id));
  }
}
