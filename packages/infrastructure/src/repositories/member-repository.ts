import { eq, and } from "drizzle-orm";
import { Member } from "@repo/core";
import type { MemberRepository } from "@repo/core";
import type { DrizzleDatabase } from "../database";
import { members } from "../database/schema";

export class DrizzleMemberRepository implements MemberRepository {
  constructor(private db: DrizzleDatabase) {}

  async findById(id: string): Promise<Member | null> {
    const rows = await this.db.select().from(members).where(eq(members.id, id)).limit(1);
    if (rows.length === 0) return null;
    const r = rows[0];
    return new Member(r.id, r.groupId, r.name, r.emoji, r.createdAt);
  }

  async findByGroupId(groupId: string): Promise<Member[]> {
    const rows = await this.db.select().from(members).where(eq(members.groupId, groupId));
    return rows.map((r) => new Member(r.id, r.groupId, r.name, r.emoji, r.createdAt));
  }

  async save(member: Member): Promise<Member> {
    await this.db
      .insert(members)
      .values({
        id: member.id,
        groupId: member.groupId,
        name: member.name,
        emoji: member.emoji,
        createdAt: member.createdAt,
      })
      .onConflictDoUpdate({
        target: members.id,
        set: {
          name: member.name,
          emoji: member.emoji,
        },
      });
    return member;
  }

  async saveMany(memberList: Member[]): Promise<Member[]> {
    if (memberList.length === 0) return [];
    await this.db.insert(members).values(
      memberList.map((m) => ({
        id: m.id,
        groupId: m.groupId,
        name: m.name,
        emoji: m.emoji,
        createdAt: m.createdAt,
      }))
    );
    return memberList;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(members).where(eq(members.id, id));
  }
}
