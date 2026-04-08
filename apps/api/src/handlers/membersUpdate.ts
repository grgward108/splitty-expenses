import { createFactory } from "hono/factory";
import { DrizzleMemberRepository } from "@repo/infrastructure";
import type { MembersUpdateContext } from "../generated/endpoints/members/members.context";
import type { AppEnv } from "../types/app-env";

const factory = createFactory<AppEnv>();

export const membersUpdateHandlers = factory.createHandlers(
  async (c: MembersUpdateContext<AppEnv>) => {
    const db = c.get("db");
    const { memberId } = c.req.param();
    const body = await c.req.json();

    const memberRepo = new DrizzleMemberRepository(db);
    const existing = await memberRepo.findById(memberId);
    if (!existing) {
      return c.json({ message: "Member not found", code: "NOT_FOUND" }, 404);
    }

    const updated = existing.update({ name: body.name, emoji: body.emoji });
    await memberRepo.save(updated);

    return c.json({
      id: updated.id,
      groupId: updated.groupId,
      name: updated.name,
      emoji: updated.emoji,
      createdAt: updated.createdAt,
    });
  }
);
