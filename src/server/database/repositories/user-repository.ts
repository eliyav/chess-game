import { db } from "../database";
import { User, NewUser, UserUpdate } from "../types";

export async function findUserById(id: number) {
  return await db
    .selectFrom("user")
    .where("id", "=", id)
    .selectAll()
    .executeTakeFirst();
}

//Exapmle of a find query using kysely filtering method
export async function findUsers(criteria: Partial<User>) {
  let query = db.selectFrom("user");

  if (criteria.username) {
    query = query.where("username", "=", criteria.username); // Kysely is immutable, you must re-assign!
  }

  return await query.selectAll().execute();
}

export async function getAllUsers() {
  return await db.selectFrom("user").selectAll().execute();
}

export async function updateUser(id: number, updateWith: UserUpdate) {
  return await db
    .updateTable("user")
    .set(updateWith)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function createUser(person: NewUser) {
  return await db
    .insertInto("user")
    .values(person)
    .returningAll()
    .executeTakeFirstOrThrow();
}

export async function deleteUser(id: number) {
  return await db
    .deleteFrom("user")
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();
}
