import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("user")
    .addColumn("course", "text", (col) => col.notNull().defaultTo(""))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("user")
    .dropColumn("course")
    .execute()
   

}