import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../utils/db";
import { encryptText } from "../../utils/encryption";
import getSession, { refreshSchedule, refreshSubjectsList, refreshUserInfo } from "../../utils/getSession";
import { getProfilePage, getSubjectsPage } from "utils/getPage";

export type LoginResponse = {
  error: string | null,
  data: {} | null
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<LoginResponse>) {
  try {
    const s = await getSession(req)

    if (s.error !== "unauthorized" && s.error !== "no session") {
      return res.send({
        error: "already",
        data: null
      }) 
    }
  
    const formData = new FormData()
    formData.append("login", req.body.login);
    formData.append("passwd", req.body.password)
    formData.append("btnSubmit", "%D3%E2%B3%E9%F2%E8")

    const response = await fetch("https://isu1.khmnu.edu.ua/isu/dbsupport/logon.php", {
      method: "POST",
      body: formData,
      cache: "no-cache",
      credentials: "include",
      redirect: "manual"
    })

    const page = await response.arrayBuffer()

    const decoder = new TextDecoder('windows-1251');
    const text = decoder.decode(page);

    if (text.includes("Аутентифікація не пройшла")) {
      return res.send({
        error: "Неправильний пароль або логін",
        data: null
      })
    }

    if (!text.includes("Вхід користувача")) {
      return res.send({
        error: "Неправильний пароль або логін",
        data: null
      })
    }

    let user = await db.selectFrom("user").selectAll().where("login", "=", req.body.login).executeTakeFirst();

    if (!user) {
      user = await db.insertInto("user")
        .values({
          login: req.body.login.trim(),
          credentials: encryptText(JSON.stringify(req.body), process.env.ENCRYPTION_KEY || "")
        })
        .returningAll()
        .executeTakeFirstOrThrow()

    }

    let session = await db.selectFrom("session")
      .selectAll()
      .where("user_id", "=", user.id)
      .executeTakeFirst()

    if (!session) {
      const newSessionId = crypto.randomUUID()

      session = await db.insertInto("session")
        .values({
          isu_cookie: response.headers.getSetCookie().toString().split("=")[1].split(";")[0],
          user_id: user?.id,
          session_id: newSessionId
        })
        .returningAll()
        .executeTakeFirstOrThrow() 

    } else {
      session = await db.updateTable("session")
        .set({
          isu_cookie: response.headers.getSetCookie().toString().split("=")[1].split(";")[0],
        })
        .where("user_id", "=", user.id)
        .returningAll()
        .executeTakeFirstOrThrow()
    }

    await refreshUserInfo(session);
    await refreshSubjectsList(session);
    await refreshSchedule(session);
 
  
    res.setHeader("Set-Cookie", `session=${session.session_id};Max-Age=2592000000`);
    res.send({
      data: {},
      error: null
    })
  } catch (err) {
    console.error(err);
    res.send({
      error: "something went wrong",
      data: null
    })
  }
  
}
