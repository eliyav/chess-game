import { defineConfig } from "kysely-ctl";
import { sqliteDialect } from "../src/server/database/database";

export default defineConfig({
  dialect: sqliteDialect,
  migrations: {
    migrationFolder: "./src/server/database/migrations",
  },
});
