import { zValidator } from "@hono/zod-validator";
import { Task } from "@repo/core";
import { DynamoDBTaskRepository } from "@repo/infrastructure";
import { createFactory } from "hono/factory";
import type { TasksCreateContext } from "../generated/endpoints/tasks/tasks.context";
import { tasksCreateBody } from "../generated/endpoints/tasks/tasks.zod";

const taskRepository = new DynamoDBTaskRepository();
const factory = createFactory();

export const tasksCreateHandlers = factory.createHandlers(
  zValidator("json", tasksCreateBody),
  async (c: TasksCreateContext) => {
    const body = c.req.valid("json");
    const id = crypto.randomUUID();

    const task = Task.create(
      id,
      body.title,
      body.description ?? null,
      body.status ?? "pending",
      body.dueDate ?? null
    );

    const saved = await taskRepository.save(task);
    return c.json(saved, 201);
  }
);
