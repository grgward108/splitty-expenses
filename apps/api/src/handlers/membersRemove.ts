import { createFactory } from "hono/factory";
import { DrizzleMemberRepository } from "@repo/infrastructure";
import type { MembersRemoveContext } from "../generated/endpoints/members/members.context";
import type { AppEnv } from "../types/app-env";

const factory = createFactory<AppEnv>();

export const membersRemoveHandlers = factory.createHandlers(
  async (c: MembersRemoveContext<AppEnv>) => {
    const db = c.get("db");
    const { memberId } = c.req.param();

    const memberRepo = new DrizzleMemberRepository(db);
    const existing = await memberRepo.findById(memberId);
    if (!existing) {
      return c.json({ message: "Member not found", code: "NOT_FOUND" }, 404);
    }

    await memberRepo.delete(memberId);
    return c.body(null, 204);
  }
);
