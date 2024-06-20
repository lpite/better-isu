import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("session")
    .addColumn("credentials", "text", (col) => col.notNull().defaultTo(""))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("session")
    .dropColumn("credentials")
    .execute()
  
}