import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z as zod } from "@hono/zod-openapi";
import { Session } from "../types/session";
import fetchAndDecode from "../utils/fetchAndDecode";
import { cacheClient } from "../utils/memcached";
import { db } from "../utils/db";
import { sql } from "kysely";
import { getTimeToEndOfWeek } from "../utils/getTimeToEndOfWeek";

export const generalRouter = new OpenAPIHono<{
  Variables: { session: Session };
}>();

const getTypeOfWeek = createRoute({
  path: "/getTypeOfWeek",
  method: "get",
  responses: {
    200: {
      description: "returns type of week",
      content: {
        "text/plain": {
          schema: zod.enum(["up", "bottom"]),
        },
      },
    },
  },
});

generalRouter.openapi(getTypeOfWeek, async (c) => {
  const cachedWeekType = await cacheClient
    .get<string>("week_type")
    .then((res) => {
      return res?.value;
    })
    .catch((err) => {
      console.error(err);
      return undefined;
    });
  if (cachedWeekType) {
    return c.text(cachedWeekType);
  }

  const { html } = await fetchAndDecode(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/logon.php",
  );
  const typeOfWeek = html
    .querySelector(".logo-time")
    ?.textContent?.split(".")[1]
    ?.trim();

  let response: "up" | "bottom" = "up";
  if (typeOfWeek === "Знаменник") {
    response = "bottom";
  }
  cacheClient.set("week_type", response, { lifetime: 60 * 60 });
  c.header("Cache-Control", `max-age=${getTimeToEndOfWeek()}`);
  return c.text(response);
});

const getStats = createRoute({
  path: "stats",
  method: "get",
  responses: {
    200: {
      description: "stats",
      content: {
        "application/json": {
          schema: zod.object({
            users: zod.number(),
            sessionsToday: zod.number(),
          }),
        },
      },
    },
  },
});

generalRouter.openapi(getStats, async (c) => {
  const users = await db
    .selectFrom("user")
    .select((eb) => eb.fn.countAll<string>("user").as("user_count"))
    .executeTakeFirst();

  const sessionsToday = await db
    .selectFrom("session")
    .select((eb) => eb.fn.countAll<string>("session").as("sessions_count"))
    .where(sql`created_at::date = now()::date` as any)
    .executeTakeFirst();

  return c.json({
    users: Number(users?.user_count) || 0,
    sessionsToday: Number(sessionsToday?.sessions_count) || 0,
  });
});
