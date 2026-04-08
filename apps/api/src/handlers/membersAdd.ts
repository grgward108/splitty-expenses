import { createFactory } from "hono/factory";
import { Member } from "@repo/core";
import { DrizzleGroupRepository, DrizzleMemberRepository } from "@repo/infrastructure";
import type { MembersAddContext } from "../generated/endpoints/members/members.context";
import type { AppEnv } from "../types/app-env";

const factory = createFactory<AppEnv>();

export const membersAddHandlers = factory.createHandlers(
  async (c: MembersAddContext<AppEnv>) => {
    const db = c.get("db");
    const { groupId } = c.req.param();
    const body = await c.req.json();

    const groupRepo = new DrizzleGroupRepository(db);
    const group = await groupRepo.findById(groupId);
    if (!group) {
      return c.json({ message: "Group not found", code: "NOT_FOUND" }, 404);
    }

    const memberRepo = new DrizzleMemberRepository(db);
    const member = Member.create(crypto.randomUUID(), groupId, body.name, body.emoji ?? "😀");
    await memberRepo.save(member);

    return c.json({
      id: member.id,
      groupId: member.groupId,
      name: member.name,
      emoji: member.emoji,
      createdAt: member.createdAt,
    });
  }
);
