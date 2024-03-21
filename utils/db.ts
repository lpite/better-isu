import { Kysely, PostgresDialect } from "kysely";
import { Pool } from 'pg'
import { DB } from "../types/db";

export const db = new Kysely<DB>({
	dialect: new PostgresDialect({
		pool: new Pool({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME,
		})
	})
})