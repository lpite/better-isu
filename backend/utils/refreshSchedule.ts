import { Session } from "../types/session";
import { db } from "./db";
import getScheduleByApi from "./getScheduleByApi";
import { sql } from "kysely";

export async function refreshSchedule(session: Session) {
  console.log("REFRESHING SCHEDULE LIST");

  const user = await db
    .selectFrom("user")
    .select("group")
    .where("user.id", "=", session.user_id)
    .executeTakeFirstOrThrow();

  const schedule = await db
    .selectFrom("schedule")
    .selectAll()
    .where("group", "=", user.group)
    .executeTakeFirst();

  if (!schedule?.id) {
    if (!user.group) {
      throw "no user group";
    }
    const scheduleFromApi = await getScheduleByApi(session.user_id);

    if (!scheduleFromApi.length) {
      throw "no schedule returned from api";
    }

    await db
      .insertInto("schedule")
      .values({
        group: user.group,
        data: JSON.stringify(scheduleFromApi),
      })
      .executeTakeFirstOrThrow();
  }

  if (!Object.keys((schedule?.data as any) || {}).length) {
    const scheduleFromApi = await getScheduleByApi(session.user_id);
    if (!scheduleFromApi.length) {
      throw "no schedule returned from api";
    }
    await db
      .updateTable("schedule")
      .set({
        data: JSON.stringify(scheduleFromApi),
        updated_at: sql`now()`,
      })
      .where("group", "=", user.group)
      .executeTakeFirstOrThrow();
  }
  const lastScheduleUpdate = schedule?.updated_at.getTime() || 0;
  const now = new Date().getTime() - new Date().getTimezoneOffset() * 60;

  if (lastScheduleUpdate && now - lastScheduleUpdate > 12 * 60 * 60 * 1000) {
    const scheduleFromApi = await getScheduleByApi(session.user_id);

    await db
      .updateTable("schedule")
      .set({
        data: JSON.stringify(scheduleFromApi),
        updated_at: sql`now()`,
      })
      .where("group", "=", user.group)
      .executeTakeFirstOrThrow();
  }
}
