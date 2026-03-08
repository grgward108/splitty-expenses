import type { Task } from "../entities/task";
import type { TaskId } from "../types";
import type { Repository } from "./index";

/**
 * Task repository interface
 */
export interface TaskRepository extends Repository<Task, TaskId> {
  /**
   * Find tasks by status
   */
  findByStatus(
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
