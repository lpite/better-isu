import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("schedule")
    .addColumn("id", "serial", (col) => col.primaryKey().notNull())
    .addColumn("group", "text", (col) => col.notNull().unique())
    .addColumn("data", "jsonb", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("schedule").execute();
}
