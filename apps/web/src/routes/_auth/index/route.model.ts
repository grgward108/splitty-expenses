export type TaskStatus = "pending" | "in_progress" | "completed";

export const statusColors: Record<TaskStatus, "default" | "warning" | "success"> = {
  pending: "default",
  in_progress: "warning",
  completed: "success",
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  dueDate?: string | null;
};

export type TaskFormData = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
};
