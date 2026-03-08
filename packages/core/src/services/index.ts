/**
 * Result type for domain operations
 */
export type Result<T, E = Error> = { success: true; value: T } | { success: false; error: E };

/**
 * Helper functions for Result type
 */
export const Result = {
  ok: <T>(value: T): Result<T, never> => ({ success: true, value }),
  fail: <E>(error: E): Result<never, E> => ({ success: false, error }),
};
