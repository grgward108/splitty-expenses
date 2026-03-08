// Common domain types

/**
 * Branded type helper for type-safe IDs
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Common ID types
 */
export type TaskId = Brand<string, "TaskId">;

/**
 * Pagination types
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Sort types
 */
export type SortDirection = "asc" | "desc";

export interface SortParams<T> {
  field: keyof T;
  direction: SortDirection;
}
