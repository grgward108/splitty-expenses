import { createFactory } from "hono/factory";
import { nanoid } from "nanoid";
import { Group, Member } from "@repo/core";
import { DrizzleGroupRepository, DrizzleMemberRepository } from "@repo/infrastructure";
import type { GroupsCreateContext } from "../generated/endpoints/groups/groups.context";
import type { AppEnv } from "../types/app-env";

const factory = createFactory<AppEnv>();

export const groupsCreateHandlers = factory.createHandlers(
  async (c: GroupsCreateContext<AppEnv>) => {
    const db = c.get("db");
    const body = await c.req.json();

    const groupRepo = new DrizzleGroupRepository(db);
    const memberRepo = new DrizzleMemberRepository(db);

    const group = Group.create(nanoid(12), body.name, body.currency ?? "USD");
    await groupRepo.save(group);

    const memberEntities = body.members.map((m: { name: string; emoji?: string }) =>
      Member.create(crypto.randomUUID(), group.id, m.name, m.emoji ?? "😀")
    );

    if (memberEntities.length > 0) {
      await memberRepo.saveMany(memberEntities);
    }

    return c.json({
      id: group.id,
      name: group.name,
      currency: group.currency,
      members: memberEntities.map((m: Member) => ({
        id: m.id,
        groupId: m.groupId,
        name: m.name,
        emoji: m.emoji,
        createdAt: m.createdAt,
      })),
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
    });
  }
);
