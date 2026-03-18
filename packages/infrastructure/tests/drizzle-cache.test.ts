import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, test } from "node:test";
import { getDb } from "../src/database/drizzle.js";

describe("getDb cache behavior", () => {
  test("returns same instance for same connection string", () => {
    const connectionString = `postgres://postgres:postgres@127.0.0.1:5432/test_${randomUUID()}`;
    const first = getDb(connectionString);
    const second = getDb(connectionString);

    assert.strictEqual(second, first);
  });

  test("returns different instances for different connection strings", () => {
    const first = getDb(`postgres://postgres:postgres@127.0.0.1:5432/test_${randomUUID()}`);
    const second = getDb(`postgres://postgres:postgres@127.0.0.1:5432/test_${randomUUID()}`);

    assert.notStrictEqual(second, first);
  });
});
