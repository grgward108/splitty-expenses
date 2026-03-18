import { zValidator } from "@hono/zod-validator";
import { DrizzleTaskRepository } from "@repo/infrastructure";
import { createFactory } from "hono/factory";
import type { TasksListContext } from "../generated/endpoints/tasks/tasks.context";
import { tasksListQueryParams } from "../generated/endpoints/tasks/tasks.zod";

const factory = createFactory();

export const tasksListHandlers = factory.createHandlers(
  zValidator("query", tasksListQueryParams),
  async (c: TasksListContext) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "Unauthorized", code: "UNAUTHORIZED" }, 401);
    }

    const db = c.get("db");
    const taskRepository = new DrizzleTaskRepository(db);
    const query = c.req.valid("query");
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const result = await taskRepository.findAll(user.id, { page, limit });
    return c.json(result);
  }
);
