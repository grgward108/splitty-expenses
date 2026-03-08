import type { Task } from "../entities/task";
import type { TaskId } from "../types";
import type { PaginatedResult, PaginationParams } from "../types";

/**
 * Task repository interface (scoped by userId)
 */
export interface TaskRepository {
  findById(userId: string, id: TaskId): Promise<Task | null>;
  findAll(userId: string, params?: PaginationParams): Promise<PaginatedResult<Task>>;
  save(task: Task): Promise<Task>;
  delete(userId: string, id: TaskId): Promise<void>;
  findByStatus(
    userId: string,
    status: Task["status"],
    params?: { page?: number; limit?: number }
  ): Promise<{
    items: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}
