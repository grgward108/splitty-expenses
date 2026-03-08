import { zValidator } from "@hono/zod-validator";
import { DynamoDBTaskRepository } from "@repo/infrastructure";
import { createFactory } from "hono/factory";
import type { TasksDeleteContext } from "../generated/endpoints/tasks/tasks.context";
import { tasksDeleteParams } from "../generated/endpoints/tasks/tasks.zod";

const taskRepository = new DynamoDBTaskRepository();
const factory = createFactory();

export const tasksDeleteHandlers = factory.createHandlers(
  zValidator("param", tasksDeleteParams),
  async (c: TasksDeleteContext) => {
    const { id } = c.req.valid("param");
    const existing = await taskRepository.findById(id as never);

    if (!existing) {
      return c.json({ message: "Task not found", code: "NOT_FOUND" }, 404);
    }

    await taskRepository.delete(id as never);
    return c.body(null, 204);
  }
);
