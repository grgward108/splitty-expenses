import { zValidator } from "@hono/zod-validator";
import { DrizzleTaskRepository } from "@repo/infrastructure";
import { createFactory } from "hono/factory";
import type { TasksDeleteContext } from "../generated/endpoints/tasks/tasks.context";
import { tasksDeleteParams } from "../generated/endpoints/tasks/tasks.zod";

const taskRepository = new DrizzleTaskRepository();
const factory = createFactory();

export const tasksDeleteHandlers = factory.createHandlers(
  zValidator("param", tasksDeleteParams),
  async (c: TasksDeleteContext) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "Unauthorized", code: "UNAUTHORIZED" }, 401);
    }

    const { id } = c.req.valid("param");
    const existing = await taskRepository.findById(user.id, id as never);

    if (!existing) {
      return c.json({ message: "Task not found", code: "NOT_FOUND" }, 404);
    }

    await taskRepository.delete(user.id, id as never);
    return c.body(null, 204);
  }
);
