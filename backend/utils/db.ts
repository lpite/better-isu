import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";

import { DB } from "../types/db";
import postgres from "postgres";

export const db = new Kysely<DB>({
  dialect: new PostgresJSDialect({
    postgres: postgres({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: true,
    }),
  }),
});
