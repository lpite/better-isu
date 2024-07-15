import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("session_update_state")
    .addColumn("id", "serial", (col) => col.notNull().primaryKey())
    .addColumn("session", "text", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("session_update_state").execute();
}
