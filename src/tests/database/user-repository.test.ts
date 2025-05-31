import { sql } from "kysely";
import { strict as assert } from "node:assert";
import { after, before, describe, it } from "node:test";
import { db } from "../../server/database/database";
import * as userRepository from "../../server/database/repositories/user-repository";

describe("user repository", () => {
  before(async () => {
    await db.schema
      .createTable("user")
      .addColumn("id", "integer", (cb) =>
        cb.primaryKey().autoIncrement().notNull()
      )
      .addColumn("username", "varchar(255)", (cb) => cb.notNull())
      .addColumn("email", "varchar(255)", (cb) => cb.notNull())
      .addColumn("password", "varchar(50)", (cb) => cb.notNull())
      .addColumn("created_at", "timestamp", (cb) =>
        cb.defaultTo(sql`current_timestamp`)
      )
      .execute();
  });

  after(async () => {
    await db.schema.dropTable("user").execute();
  });

  it("should create a user", async () => {
    const user = await userRepository.createUser({
      username: "eliyav",
      email: "eliyavahl@gmail.com",
      password: "password123",
    });
    assert.equal(user.username, "eliyav");
    assert.equal(user.email, "eliyavahl@gmail.com");
    assert.ok(user.created_at);
    assert.ok(user.id > 0);
  });

  it("should find a user with a given id", async () => {
    const user = await userRepository.findUserById(1);
    assert.equal(user?.id, 1);
  });

  it("should find all username eliyav", async () => {
    const result = await userRepository.findUsers({ username: "eliyav" });
    assert.ok(result.length > 0);
    assert.equal(result[0].username, "eliyav");
  });

  it("should update email of a user with a given id", async () => {
    const user = await userRepository.updateUser(1, {
      email: "testing@gmail.com",
    });
    assert.equal(user.id, 1);
    assert.equal(user.email, "testing@gmail.com");
  });

  it("should delete a user with a given id", async () => {
    const user = await userRepository.deleteUser(1);
    if (!user) {
      assert.fail("User should not be null");
    }
    assert.equal(user.id, 1);
  });
});
