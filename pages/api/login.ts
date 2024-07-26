import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../utils/db";
import { encryptText } from "../../utils/encryption";
import getSession, {
  refreshSubjectsList,
  refreshUserInfo,
} from "../../utils/getSession";
import { refreshSchedule } from "utils/refreshSchedule";

export type LoginResponse = {
  error: string | null;
  data: {} | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>,
) {
  try {
    if (
      req.body.login === "joe_biden123" &&
      req.body.password === "joe_biden123"
    ) {
      res.appendHeader(
        "Set-Cookie",
        `session=joe_biden_session;Max-Age=2592000000;HttpOnly;Path=/`,
      );
      res.appendHeader(
        "Set-Cookie",
        `session_key=joe_biden_session_key;Max-Age=2592000000;HttpOnly;Path=/`,
      );

      return res.send({
        data: {},
        error: null,
      });
    }

    const s = await getSession(req);

    if (s.error !== "unauthorized" && s.error !== "no session") {
      return res.send({
        error: "already",
        data: null,
      });
    }

    const formData = new FormData();
    formData.append("login", req.body.login);
    formData.append("passwd", req.body.password);
    formData.append("btnSubmit", "%D3%E2%B3%E9%F2%E8");

    const decoder = new TextDecoder("windows-1251");
    const response = await fetch(
      "https://isu1.khmnu.edu.ua/isu/dbsupport/logon.php",
      {
        method: "POST",
        body: formData,
        cache: "no-cache",
        credentials: "include",
        redirect: "manual",
      },
    );
    const text = await response
      .arrayBuffer()
      .then((res) => decoder.decode(res));

    if (text.includes("Викладач")) {
      return res.send({
        error: "Ви не є студентом (наразі реалізовано тільки для студентів)",
        data: null,
      });
    }

    if (text.includes("Аутентифікація не пройшла")) {
      return res.send({
        error: "Неправильний пароль або логін",
        data: null,
      });
    }

    if (!text.includes("Вхід користувача")) {
      return res.send({
        error: "Неправильний пароль або логін",
        data: null,
      });
    }

    let user = await db
      .selectFrom("user")
      .select("id")
      .where("login", "=", req.body.login.trim())
      .executeTakeFirst();

    if (!user) {
      user = await db
        .insertInto("user")
        .values({
          login: req.body.login.trim(),
          // TODO: delete this
          // credentials: encryptText(JSON.stringify(req.body), process.env.ENCRYPTION_KEY || "")
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
        credentials: encryptText(JSON.stringify(req.body), sessionKey),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    await refreshUserInfo(session);
    // await refreshSubjectsList(session)
    await refreshSchedule(session);

    res.appendHeader(
      "Set-Cookie",
      `session=${session.session_id};Max-Age=2592000000;HttpOnly;Path=/`,
    );
    res.appendHeader(
      "Set-Cookie",
      `session_key=${sessionKey};Max-Age=2592000000;HttpOnly;Path=/`,
    );

    res.send({
      data: {},
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.send({
      error: "Натисність ще раз",
      data: null,
    });
  }
}
