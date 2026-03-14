import { zValidator } from "@hono/zod-validator";
import { DrizzleTaskRepository } from "@repo/infrastructure";
import { createFactory } from "hono/factory";
import type { TasksGetContext } from "../generated/endpoints/tasks/tasks.context";
import { tasksGetParams } from "../generated/endpoints/tasks/tasks.zod";

const factory = createFactory();

export const tasksGetHandlers = factory.createHandlers(
  zValidator("param", tasksGetParams),
  async (c: TasksGetContext) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "Unauthorized", code: "UNAUTHORIZED" }, 401);
    }

    const db = c.get("db");
    const taskRepository = new DrizzleTaskRepository(db);
    const { id } = c.req.valid("param");
    const task = await taskRepository.findById(user.id, id as never);

    if (!task) {
      return c.json({ message: "Task not found", code: "NOT_FOUND" }, 404);
    }

    return c.json(task);
  }
);
