import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { Database } from "./types.js";

export const sqliteDialect = new SqliteDialect({
  database: new SQLite("./src/server/database/database.sqlite"),
});

export const db = new Kysely<Database>({
  dialect: sqliteDialect,
});
