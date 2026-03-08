export interface Entity<T> {
  id: T;
  equals(other: Entity<T>): boolean;
}

/**
 * Base class for domain entities
 */
export abstract class BaseEntity<T> implements Entity<T> {
  constructor(public readonly id: T) {}

  equals(other: Entity<T>): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.id === other.id;
  }
}
