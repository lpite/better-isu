import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("subjects_list")
    .addColumn("user_id", "int4", (col) => col.references("user.id").notNull())
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("subjects_list").dropColumn("user_id").execute();

}