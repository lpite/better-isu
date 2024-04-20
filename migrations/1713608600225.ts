import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.createIndex("session_update_state_idx")
    .on("session_update_state")
    .column("session")
    .unique()
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex("session_update_state_idx")
    .execute()
  
}