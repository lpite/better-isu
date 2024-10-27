import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createIndex("subjects_list_user_id_index")
    .on("subjects_list")
    .column("user_id")
    .unique()
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable("subjects_list")
    .dropIndex("subjects_list_user_id_index")
    .execute();
}
