// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../utils/db";
import { encryptText } from "../../utils/encryption";
import getSession from "../../utils/getSession";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

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
  if (!text.includes("Вхід користувача")) {
    return res.send({
      error: "wrong login or password",
      data: null
    })
  }

  const newSessionId = crypto.randomUUID()


  let user = await db.selectFrom("user").selectAll().where("login", "=", req.body.login).executeTakeFirst();

  if (!user) {
    user = await db.insertInto("user")
      .values({
        login: req.body.login,
        credentials: encryptText(JSON.stringify(req.body), process.env.ENCRYPTION_KEY || "")
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  } else {

  }


  

  await db.insertInto("session")
    .values({
      isu_cookie: response.headers.getSetCookie().toString().split("=")[1].split(";")[0],
      user_id: user?.id,
      session_id: newSessionId
    })
    .executeTakeFirst()

  res.setHeader("Set-Cookie", `session=${newSessionId}`);
  res.send({
    data: {},
    error: null
  })
}
