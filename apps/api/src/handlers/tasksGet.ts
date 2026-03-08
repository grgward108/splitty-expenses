import { zValidator } from "@hono/zod-validator";
import { DynamoDBTaskRepository } from "@repo/infrastructure";
import { createFactory } from "hono/factory";
import type { TasksGetContext } from "../generated/endpoints/tasks/tasks.context";
import { tasksGetParams } from "../generated/endpoints/tasks/tasks.zod";

const taskRepository = new DynamoDBTaskRepository();
const factory = createFactory();

export const tasksGetHandlers = factory.createHandlers(
  zValidator("param", tasksGetParams),
  async (c: TasksGetContext) => {
    const { id } = c.req.valid("param");
    const task = await taskRepository.findById(id as never);

    if (!task) {
      return c.json({ message: "Task not found", code: "NOT_FOUND" }, 404);
    }

    return c.json(task);
  }
);
