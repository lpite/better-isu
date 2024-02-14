import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("subjects_list")
    .addColumn("id", "serial", (cl) => cl.primaryKey())
    .addColumn("data", "jsonb", (cl) => cl.notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("subjects_list").execute();

}