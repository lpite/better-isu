import { Kysely } from "kysely";
import { PostgresJSDialect } from "kysely-postgres-js";
import postgres from "postgres";
import { DB } from "../types/db";

export const db = new Kysely<DB>({
	dialect: new PostgresJSDialect({
		postgres: postgres({
			host: process.env.DB_HOST,
			username: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
		})
	})
})