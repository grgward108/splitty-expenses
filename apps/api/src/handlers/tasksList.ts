import { zValidator } from "@hono/zod-validator";
import { DynamoDBTaskRepository } from "@repo/infrastructure";
import { createFactory } from "hono/factory";
import type { TasksListContext } from "../generated/endpoints/tasks/tasks.context";
import { tasksListQueryParams } from "../generated/endpoints/tasks/tasks.zod";

const taskRepository = new DynamoDBTaskRepository();
const factory = createFactory();

export const tasksListHandlers = factory.createHandlers(
  zValidator("query", tasksListQueryParams),
  async (c: TasksListContext) => {
    const query = c.req.valid("query");
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const result = await taskRepository.findAll({ page, limit });
    return c.json(result);
  }
);
