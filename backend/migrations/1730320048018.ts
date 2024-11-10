import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable("user").dropColumn("credentials").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // yea
}
