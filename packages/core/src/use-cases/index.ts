/**
 * Use Case layer
 * Application business logic and orchestration
 */

import type { DomainError } from "../errors";
import type { Result } from "../services";

/**
 * Base interface for all use cases
 * Represents a single application operation
 *
 * @template TInput - Input data type for the use case
 * @template TOutput - Output data type on success
 * @template TError - Error type on failure (defaults to DomainError)
 */
export interface UseCase<TInput, TOutput, TError = DomainError> {
  /**
   * Execute the use case with the given input
   */
  execute(input: TInput): Promise<Result<TOutput, TError>>;
}

/**
 * Use case that requires no input
 */
export interface NoInputUseCase<TOutput, TError = DomainError> {
  /**
   * Execute the use case
   */
  execute(): Promise<Result<TOutput, TError>>;
}

/**
 * Use case that returns no output (commands)
 */
export interface CommandUseCase<TInput, TError = DomainError> {
  /**
   * Execute the command
   */
  execute(input: TInput): Promise<Result<void, TError>>;
}

/**
 * Use case context for dependency injection
 * Provides access to repositories and services
 */
export interface UseCaseContext<TRepositories = unknown, TServices = unknown> {
  repositories: TRepositories;
  services: TServices;
}

/**
 * Base class for use cases with common functionality
 */
export abstract class BaseUseCase<TInput, TOutput, TError = DomainError>
  implements UseCase<TInput, TOutput, TError>
{
  abstract execute(input: TInput): Promise<Result<TOutput, TError>>;
}
