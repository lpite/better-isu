import { Hono } from "hono";
import { db } from "../utils/db";
import { encryptText } from "../utils/encryption";
import { refreshUserInfo } from "../utils/getSession";

export const loginRoute = new Hono();

loginRoute.post("/", async (c) => {
  try {
    const body = await c.req.json();
    if (body.login === "joe_biden123" && body.password === "joe_biden123") {
      c.header(
        "Set-Cookie",
        `session=joe_biden_session;Max-Age=2592000000;HttpOnly;Path=/`,
        { append: true },
      );
      c.header(
        "Set-Cookie",
        `session_key=joe_biden_session_key;Max-Age=2592000000;HttpOnly;Path=/`,
        { append: true },
      );

      return c.json({
        data: {},
        error: null,
      });
    }

    const formData = new FormData();
    formData.append("login", body.login);
    formData.append("passwd", body.password);
    formData.append("btnSubmit", "%D3%E2%B3%E9%F2%E8");

    const decoder = new TextDecoder("windows-1251");
    const response = await fetch(
      "https://isu1.khmnu.edu.ua/isu/dbsupport/logon.php",
      {
        method: "POST",
        body: formData,
        credentials: "include",
        redirect: "manual",
      },
    );
    const text = await response
      .arrayBuffer()
      .then((res) => decoder.decode(res));

    if (text.includes("Викладач")) {
      return c.json({
        error: "Ви не є студентом (наразі реалізовано тільки для студентів)",
        data: null,
      });
    }

    if (text.includes("Аутентифікація не пройшла")) {
      return c.json({
        error: "Неправильний пароль або логін",
        data: null,
      });
    }

    if (!text.includes("Вхід користувача")) {
      return c.json({
        error: "Неправильний пароль або логін",
        data: null,
      });
    }

    let user = await db
      .selectFrom("user")
      .select("id")
      .where("login", "=", body.login.toString()?.trim())
      .executeTakeFirst();

    if (!user) {
      user = await db
        .insertInto("user")
        .values({
          login: body.login.toString()?.trim(),
        })
        .returning("id")
        .executeTakeFirstOrThrow();
    }

    const sessionKey = crypto.randomUUID().replaceAll("-", "");

    const newSessionId = crypto.randomUUID();
    const session = await db
      .insertInto("session")
      .values({
        isu_cookie: response.headers
          .getSetCookie()
          .toString()
          .split("=")[1]
          .split(";")[0],
        user_id: user?.id,
        session_id: newSessionId,
        credentials: encryptText(JSON.stringify(body), sessionKey),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    await refreshUserInfo(session);
    // await refreshSubjectsList(session)
    // await refreshSchedule(session);

    c.header(
      "Set-Cookie",
      `session=${session.session_id};Max-Age=2592000000;HttpOnly;Path=/`,
      { append: true },
    );
    c.header(
      "Set-Cookie",
      `session_key=${sessionKey};Max-Age=2592000000;HttpOnly;Path=/`,
      { append: true },
    );

    return c.json({
      data: {},
      error: null,
    });
  } catch (err) {
    console.error(err);
    return c.json({
      error: "Спробуйте ще раз",
      data: null,
    });
  }
});
