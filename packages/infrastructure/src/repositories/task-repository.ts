import type { TaskRepository } from "@repo/core";
import { Task, type TaskStatus } from "@repo/core";
import type { PaginatedResult, PaginationParams, TaskId } from "@repo/core";
import { eq, sql } from "drizzle-orm";
import { db } from "../database/drizzle.js";
import { tasks } from "../database/schema.js";

/**
 * Drizzle/PostgreSQL implementation of TaskRepository
 */
export class DrizzleTaskRepository implements TaskRepository {
  async findById(id: TaskId): Promise<Task | null> {
    const [row] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, String(id)))
      .limit(1);
    if (!row) return null;
    return this.mapToTask(row);
  }

  async findAll(params?: PaginationParams): Promise<PaginatedResult<Task>> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const offset = (page - 1) * limit;

    const [countResult] = await db.select({ count: sql<number>`count(*)::int` }).from(tasks);
    const total = countResult?.count ?? 0;

    const rows = await db.select().from(tasks).limit(limit).offset(offset);
    const items = rows.map((row) => this.mapToTask(row));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async save(task: Task): Promise<Task> {
    await db
      .insert(tasks)
      .values({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        dueDate: task.dueDate,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })
      .onConflictDoUpdate({
        target: tasks.id,
        set: {
          title: task.title,
          description: task.description,
          status: task.status,
          dueDate: task.dueDate,
          updatedAt: task.updatedAt,
        },
      });
    return task;
  }

  async delete(id: TaskId): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, String(id)));
  }

  async findByStatus(
    status: TaskStatus,
    params?: { page?: number; limit?: number }
  ): Promise<{
    items: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const offset = (page - 1) * limit;

    const countRows = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(eq(tasks.status, status));
    const total = countRows[0]?.count ?? 0;

    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.status, status))
      .limit(limit)
      .offset(offset);
    const items = rows.map((row) => this.mapToTask(row));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private mapToTask(row: {
    id: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
  }): Task {
    return new Task(
      row.id,
      row.title,
      row.description ?? null,
      row.status,
      row.dueDate ?? null,
      row.createdAt,
      row.updatedAt
    );
  }
}
