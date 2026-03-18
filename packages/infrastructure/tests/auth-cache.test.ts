import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, test } from "node:test";
import { getAuth } from "../src/auth/auth.js";
import { getDb } from "../src/database/drizzle.js";

const createDbConnectionString = () =>
  `postgres://postgres:postgres@127.0.0.1:5432/test_${randomUUID()}`;

describe("getAuth cache behavior", () => {
  test("returns same instance for equivalent config", () => {
    const db = getDb(createDbConnectionString());
    const first = getAuth({
      db,
      googleClientId: "client-id",
      googleClientSecret: "client-secret",
      trustedOrigins: ["http://localhost:3000", "http://localhost:5173"],
    });
    const second = getAuth({
      db,
      googleClientId: "client-id",
      googleClientSecret: "client-secret",
      trustedOrigins: ["http://localhost:5173", "http://localhost:3000"],
    });

    assert.strictEqual(second, first);
  });

  test("returns different instances when auth config changes", () => {
    const db = getDb(createDbConnectionString());
    const first = getAuth({
      db,
      googleClientId: "client-id-1",
      googleClientSecret: "client-secret",
      trustedOrigins: ["http://localhost:3000"],
    });
    const second = getAuth({
      db,
      googleClientId: "client-id-2",
      googleClientSecret: "client-secret",
      trustedOrigins: ["http://localhost:3000"],
    });

    assert.notStrictEqual(second, first);
  });

  test("returns different instances when database changes", () => {
    const first = getAuth({
      db: getDb(createDbConnectionString()),
      googleClientId: "client-id",
      googleClientSecret: "client-secret",
      trustedOrigins: ["http://localhost:3000"],
    });
    const second = getAuth({
      db: getDb(createDbConnectionString()),
      googleClientId: "client-id",
      googleClientSecret: "client-secret",
      trustedOrigins: ["http://localhost:3000"],
    });

    assert.notStrictEqual(second, first);
  });
});
