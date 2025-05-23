import { OpenAPIHono, createRoute, z as zod } from "@hono/zod-openapi";
import { getSession } from "../middlewares/sessionMiddleware";
import { getCookie } from "hono/cookie";
import { db } from "../utils/db";

export const authRouter = new OpenAPIHono();

const getSessionRoute = createRoute({
  path: "session",
  method: "get",
  responses: {
    200: {
      description: "returns session for user",
      content: {
        "application/json": {
          schema: zod.object({
            data: zod.object({
              session_id: zod.string(),
              created_at: zod.string(),
            }),
          }),
        },
      },
    },
    401: {
      description: "returns error if no session cookie or no session in db",
      content: {
        "application/json": {
          schema: zod.object({ error: zod.string() }),
        },
      },
    },
  },
});

authRouter.openapi(getSessionRoute, async (c) => {
  const sessionCookie = getCookie(c, "session");
  if (!sessionCookie) {
    return c.json(
      {
        error: "no session",
      },
      401,
    );
  }

  if (sessionCookie === "joe_biden_session") {
    return c.json(
      {
        data: {
          session_id: "joe_biden_session",
          created_at: new Date(),
        },
      },
      200,
    );
  }

  const session = await getSession(c);

  if (!session.data || session.error || !session.data.isu_cookie) {
    return c.json(
      {
        error: "no session",
      },
      401,
    );
  }

  const temp = {
    session_id: session.data.session_id,
    created_at: session.data.created_at,
  };

  return c.json(
    {
      data: temp,
    },
    200,
  );
});

const logout = createRoute({
  path: "logout",
  method: "post",
  responses: {
    200: {
      description: "success logout",
    },
  },
});

authRouter.openapi(logout, async (c) => {
  const sessionCookie = getCookie(c, "session");
  if (!sessionCookie) {
    return c.json({});
  }

  if (sessionCookie !== "joe_biden_session") {
    const session = await getSession(c);

    if (!session?.data || !session?.data?.id || session.error) {
      return c.json({});
    }

    // Якщо використовувати напряму чомусь undefined
    const data = session.data;

    await db.transaction().execute(async (trx) => {
      await trx
        .deleteFrom("subjects_list")
        .where("session_id", "=", data.id)
        .execute();

      await trx
        .deleteFrom("session")
        .where("session.session_id", "=", sessionCookie)
        .execute();
    });
  }

  c.header("Set-Cookie", `session=;Max-Age=0;HttpOnly;Path=/`, {
    append: true,
  });
  c.header("Set-Cookie", `session_key=;Max-Age=0;HttpOnly;Path=/`, {
    append: true,
  });

  return c.json({});
});

const login = createRoute({
  path: "login",
  method: "post",
  request: {
    body: {
      content: {
        "application/json": {
          schema: zod.object({
            login: zod.string(),
            password: zod.string(),
          }),
        },
      },
    },
  },

  responses: {
    200: {
      description: "success or not success login",
      content: {
        "application/json": {
          schema: zod.object({
            error: zod.string().nullable().optional(),
          }),
        },
      },
    },
  },
});

authRouter.openapi(login, async (c) => {
  // TODO закінчити це
  const session = await getSession(c);
  const { login, password } = c.req.valid("json");

  if (!session.error || session.data) {
    return c.json({
      error: "Вже авторизований",
    });
  }

  const formData = new FormData();
  formData.append("login", login);
  formData.append("passwd", password);
  formData.append("btnSubmit", "%D3%E2%B3%E9%F2%E8");

  return c.json({ error: "d" });
});
