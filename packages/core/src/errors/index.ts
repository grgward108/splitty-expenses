/**
 * Domain error types
 * Base error types for domain layer
 */

/**
 * Base domain error interface
 */
export interface DomainError {
  message: string;
  code?: string;
  cause?: unknown;
}

/**
 * Base domain error class
 */
export class BaseDomainError extends Error implements DomainError {
  code?: string;
  cause?: unknown;

  constructor(message: string, code?: string, cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.cause = cause;
    // captureStackTrace is a V8-specific API (Node.js, Chrome)
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
