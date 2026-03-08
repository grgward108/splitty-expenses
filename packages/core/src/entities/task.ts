import { BaseEntity } from "./base-entity";

/**
 * Task status enum
 */
export type TaskStatus = "pending" | "in_progress" | "completed";

/**
 * Task entity
 */
export class Task extends BaseEntity<string> {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly status: TaskStatus,
    public readonly dueDate: string | null,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {
    super(id);
  }

  /**
   * Create a new Task
   */
  static create(
    id: string,
    title: string,
    description: string | null,
    status: TaskStatus,
    dueDate: string | null
  ): Task {
    const now = new Date().toISOString();
    return new Task(id, title, description, status, dueDate, now, now);
  }

  /**
   * Update task properties
   */
  update(updates: {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
    dueDate?: string | null;
  }): Task {
    return new Task(
      this.id,
      updates.title ?? this.title,
      updates.description !== undefined ? updates.description : this.description,
      updates.status ?? this.status,
      updates.dueDate !== undefined ? updates.dueDate : this.dueDate,
      this.createdAt,
      new Date().toISOString()
    );
  }
}
