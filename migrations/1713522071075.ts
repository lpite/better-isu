import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("user")
    .addColumn("group_id", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("faculty_id", "integer", (col) => col.notNull().defaultTo(0))

    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("user")
    .dropColumn("group_id")
    .dropColumn("faculty_id")
    .execute()
   

}