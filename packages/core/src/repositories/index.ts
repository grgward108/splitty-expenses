/**
 * Repository interfaces for domain entities
 * These are abstract contracts that infrastructure layer must implement
 */

import type { PaginatedResult, PaginationParams } from "../types";

/**
 * Base repository interface
 */
export interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(params?: PaginationParams): Promise<PaginatedResult<T>>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
}

/**
 * Repository with additional query capabilities
 */
export interface QueryRepository<T, ID> extends Repository<T, ID> {
  exists(id: ID): Promise<boolean>;
  count(): Promise<number>;
}

// Domain-specific repositories
export * from "./group-repository";
export * from "./member-repository";
export * from "./expense-repository";
