/**
 * Repository interfaces for domain entities
 * These are abstract contracts that infrastructure layer must implement
 */

import type { PaginatedResult, PaginationParams } from "../types";

/**
 * Base repository interface
 * Defines standard CRUD operations for domain entities
 */
export interface Repository<T, ID> {
  /**
   * Find an entity by its unique identifier
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Find all entities with optional pagination
   */
  findAll(params?: PaginationParams): Promise<PaginatedResult<T>>;

  /**
   * Save (create or update) an entity
   */
  save(entity: T): Promise<T>;

  /**
   * Delete an entity by its unique identifier
   */
  delete(id: ID): Promise<void>;
}

/**
 * Repository with additional query capabilities
 */
export interface QueryRepository<T, ID> extends Repository<T, ID> {
  /**
   * Check if an entity exists by its unique identifier
   */
  exists(id: ID): Promise<boolean>;

  /**
   * Count all entities
   */
  count(): Promise<number>;
}

// Task repository
export * from "./task-repository";
