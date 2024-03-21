import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("user")
    .addColumn("name", "text", (col) => col.defaultTo("").notNull())
    .addColumn("surname", "text", (col) => col.defaultTo("").notNull())
    .addColumn("group", "text", (col) => col.defaultTo("").notNull())
    .addColumn("record_number", "text", (col) => col.defaultTo("").notNull())
    .addColumn("faculty", "text", (col) => col.defaultTo("").notNull())
    .execute()

  await db.schema.alterTable("subjects_list")
    .addColumn("created_at", "timestamptz", (col) => col.defaultTo(sql`now()`).notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("user")
    .dropColumn("name")
    .dropColumn("surname")
    .dropColumn("group")
    .dropColumn("record_number")
    .execute();

  await db.schema.alterTable("subjects_list")
    .dropColumn("created_at")
    .execute()

}