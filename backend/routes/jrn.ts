import { sessionMiddleware } from "../middlewares/sessionMiddleware";
import { Hono } from "hono";
import { Session } from "../types/session";

// роут для запитів з сторінки журналу

export const jrnRoute = new Hono<{
  Variables: { session: Session };
}>();

jrnRoute.use(sessionMiddleware);

jrnRoute.post("/:file", async (c) => {
  const session = c.get("session");
  const body = await c.req.parseBody();
  const data = await fetch(
    `https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/${c.req.param().file}`,
    {
      method: "POST",
      body: new URLSearchParams(body as any).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: `PHPSESSID=${session.isu_cookie}`,
      },
    },
  ).then((res) => res.text());
  return c.text(data);
});
