import { createFactory } from "hono/factory";
import { DrizzleGroupRepository } from "@repo/infrastructure";
import type { GroupsGetContext } from "../generated/endpoints/groups/groups.context";
import type { AppEnv } from "../types/app-env";

const factory = createFactory<AppEnv>();

export const groupsGetHandlers = factory.createHandlers(
  async (c: GroupsGetContext<AppEnv>) => {
    const db = c.get("db");
    const { groupId } = c.req.param();

    const groupRepo = new DrizzleGroupRepository(db);
    const result = await groupRepo.findByIdWithMembers(groupId);

    if (!result) {
      return c.json({ message: "Group not found", code: "NOT_FOUND" }, 404);
    }

    return c.json({
      id: result.group.id,
      name: result.group.name,
      currency: result.group.currency,
      members: result.members.map((m) => ({
        id: m.id,
        groupId: m.groupId,
        name: m.name,
        emoji: m.emoji,
        createdAt: m.createdAt,
      })),
      createdAt: result.group.createdAt,
      updatedAt: result.group.updatedAt,
    });
  }
);
