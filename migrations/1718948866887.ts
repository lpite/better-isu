import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("subjects_list")
    .addColumn("session_id", "integer", (col) => col.references("session.id").notNull())
    .dropColumn("user_id")
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("subjects_list")
    .dropColumn("session_id")
    .addColumn("user_id", "int4", (col) => col.references("user.id").notNull())
    .execute() 
}