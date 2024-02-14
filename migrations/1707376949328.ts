import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("user")
    .addColumn("id", "serial", (cl) => cl.primaryKey().notNull())
    .addColumn("login", "text", (cl) => cl.notNull().unique())
    .execute()

  await db.schema
    .createTable("session")
    .addColumn("id", "serial", (cl) => cl.primaryKey().notNull())
    .addColumn("session_id", "text", (cl) => cl.notNull())
    .addColumn("user_id", "integer", (cl) => cl.references("user.id").notNull())
    .addColumn("isu_cookie", "text", (cl) => cl.notNull())
    .addColumn("created_at", "timestamptz", (cl) => cl.notNull().defaultTo(sql`now()`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("user").execute();
  await db.schema.dropTable("session").execute();

}