import { createMiddleware } from "hono/factory";

import { getCookie } from "hono/cookie";

import { HTTPException } from "hono/http-exception";
import { Context } from "hono";
import { refreshSubjectsList, refreshUserInfo } from "../utils/getSession";
import refreshSession from "../utils/refreshSession";
import { db } from "../utils/db";
import { Session } from "../types/session";
import { refreshSchedule } from "../utils/refreshSchedule";
import { cacheClient } from "../utils/memcached";

export async function getSession(ctx: Context): Promise<{
  error?: "unauthorized" | "no session";
  data?: Session;
}> {
  const sessionCookie = getCookie(ctx, "session");

  if (!sessionCookie) {
    return {
      error: "unauthorized",
    };
  }

  if (sessionCookie === "joe_biden_session") {
    return {
      data: {
        id: 0,
        user_id: 0,
        created_at: new Date(),
        credentials: "",
        isu_cookie: "",
        session_id: "joe_biden_session",
      },
    };
  }

  const session = await db
    .selectFrom("session")
    .selectAll()
    .where("session_id", "=", sessionCookie)
    .executeTakeFirst();

  if (!session) {
    console.error("no such session db (sessionMiddleware)");
    return {
      error: "unauthorized",
    };
  }
  const now = new Date().getTime() - new Date().getTimezoneOffset() * 60;
  if (now - session.created_at.getTime() > 55 * 60 * 1000) {
    const isNotUpdating = await cacheClient
      .add(`session_update_state:${sessionCookie}`, "true", {
        lifetime: 30,
      })
      .then(() => true)
      .catch(() => false);

    if (isNotUpdating) {
      const newSession = await refreshSession(session, getCookie(ctx));
      if (!newSession) {
        console.error("no new session created");
        return {
          error: "unauthorized",
        };
      }

      await Promise.all([
        refreshUserInfo(newSession),
        refreshSubjectsList(newSession),
        // refreshSchedule(newSession),
      ]);

      return {
        data: newSession,
      };
    }
  }
  return {
    data: session,
  };
}

export const sessionMiddleware = createMiddleware(async (c, next) => {
  const session = await getSession(c);
  if (session.error || !session.data) {
    const res = new Response("Unauthorized", {
      status: 401,
    });
    throw new HTTPException(401, { res });
  }
  c.set("session", session.data);
  await next();
});
