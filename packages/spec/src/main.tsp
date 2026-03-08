import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

@service({
  title: "Monorepo API",
})
@server("http://localhost:3000", "Development server")
namespace MonorepoApi;

// =====================================
// Models
// =====================================

// Task status enum
enum TaskStatus {
  pending: "pending",
  in_progress: "in_progress",
  completed: "completed",
}

model Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: utcDateTime;
  createdAt: utcDateTime;
  updatedAt: utcDateTime;
}

model CreateTaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus = TaskStatus.pending;
  dueDate?: utcDateTime;
}

model UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: utcDateTime;
}

model PaginatedResponse<T> {
  items: T[];
  total: int32;
  page: int32;
  limit: int32;
  totalPages: int32;
}

model ErrorResponse {
  message: string;
  code: string;
}

// =====================================
// Query Parameters
// =====================================

model PaginationQuery {
  @query page?: int32 = 1;
  @query limit?: int32 = 10;
}

// =====================================
// Routes
// =====================================

@route("/tasks")
@tag("tasks")
namespace Tasks {
  @get
  op list(...PaginationQuery): PaginatedResponse<Task> | ErrorResponse;

  @get
  @route("/{id}")
  op get(@path id: string): Task | ErrorResponse;

  @post
  op create(@body body: CreateTaskRequest): Task | ErrorResponse;

  @put
  @route("/{id}")
  op update(@path id: string, @body body: UpdateTaskRequest): Task | ErrorResponse;

  @delete
  @route("/{id}")
  op delete(@path id: string): void | ErrorResponse;
}

@route("/health")
@tag("health")
namespace Health {
  @get
  op check(): {
    status: "ok" | "error";
    timestamp: utcDateTime;
  };
}






