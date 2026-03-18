import { zValidator } from "@hono/zod-validator";
import { DrizzleTaskRepository } from "@repo/infrastructure";
import { createFactory } from "hono/factory";
import type { TasksUpdateContext } from "../generated/endpoints/tasks/tasks.context";
import { tasksUpdateBody, tasksUpdateParams } from "../generated/endpoints/tasks/tasks.zod";

const factory = createFactory();

export const tasksUpdateHandlers = factory.createHandlers(
  zValidator("param", tasksUpdateParams),
  zValidator("json", tasksUpdateBody),
  async (c: TasksUpdateContext) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ message: "Unauthorized", code: "UNAUTHORIZED" }, 401);
    }

    const db = c.get("db");
    const taskRepository = new DrizzleTaskRepository(db);
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const existing = await taskRepository.findById(user.id, id as never);

    if (!existing) {
      return c.json({ message: "Task not found", code: "NOT_FOUND" }, 404);
    }

    const updated = existing.update({
      title: body.title,
      description: body.description,
      status: body.status,
      dueDate: body.dueDate,
    });

    const saved = await taskRepository.save(updated);
    return c.json(saved);
  }
);
