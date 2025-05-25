import { QueryFailedError } from "typeorm";

export type SqliteError = QueryFailedError<{
  code: string;
  name: string;
  message: string;
  stack?: string;
}>;
