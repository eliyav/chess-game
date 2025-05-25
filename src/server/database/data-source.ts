import { DataSource } from "typeorm";
import { User } from "./entity/user";

export function initDB() {
  const appDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
  });

  appDataSource
    .initialize()
    .then(() => {
      console.log("Data Source has been initialized!");
    })
    .catch((err) => {
      console.error("Error initializing Data Source", err);
    });

  return appDataSource;
}
