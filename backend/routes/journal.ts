import { sessionMiddleware } from "backend/middlewares/sessionMiddleware";
import { Hono } from "hono";
import { Session } from "types/session";
import { db } from "utils/db";
import { refreshSubjectsList } from "utils/getSession";
import zod from "zod";

export const journalRoute = new Hono<{
  Variables: { session: Session };
}>();

journalRoute.use(sessionMiddleware);

journalRoute.get("/", async (c) => {
  const querySchema = zod.object({
    index: zod.string().min(1),
    c: zod
      .string()
      .optional()
      .default("0")
      .transform((c) => parseInt(c)),
  });

  const query = querySchema.parse(c.req.query());

  if (query.c > 3) {
    return c.html(
      '<div style="width:100vw;height:100vh;display:flex;justify-items:center;align-items:center;"><h1 style="text-align:center; width:100%;">Спробуйте ще раз</h1></div>',
    );
  }
  const session = c.get("session");

  const subjects = await db
    .selectFrom("subjects_list")
    .select(["data"])
    .where("session_id", "=", session.id)
    .executeTakeFirstOrThrow();

  const data = subjects.data as any;

  const { link: journal_link } = data[query.index];

  let journalPage = await fetch(
    `https://isu1.khmnu.edu.ua/isu/dbsupport/students/journals.php?key=${journal_link}`,
    {
      headers: {
        Cookie: `PHPSESSID=${session.isu_cookie}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  ).then((res) => res.text());

  if (journalPage.includes("Key violation")) {
    await refreshSubjectsList(session);
    // TODO якось показуавати лоадер коли список предметів не завантажений
    // return c.html(`<div
    // 					style="width:100vw;height:100vh;display:flex;justify-items:center;align-items:center;">
    // 				<div style="height:50px;width:50px;border:2px solid gray;border-bottom-color:transparent;"></div>
    // 				</div>`)
    return c.redirect(
      `/api/hono/journal?index=${query.index}&c=${query.c + 1}`,
    );
  }

  if (
    journalPage.includes("http://isu1.khmnu.edu.ua/isu/dbsupport/logon.php")
  ) {
    return c.redirect(
      `/api/hono/journal?index=${query.index}&c=${query.c + 1}`,
    );
  }

  journalPage =
    journalPage.slice(0, 105) +
    `<meta name="theme-color" content="#020817" />` +
    journalPage.slice(105);

  c.header("Cache-Control", "max-age=604800, stale-while-revalidate=604800");

  return c.html(
    journalPage
      .replaceAll(
        "../../js/extjs4/locale/ext-lang-ukr.js",
        "https://isu1.khmnu.edu.ua/isu/js/extjs4/locale/ext-lang-ukr.js",
      )
      .replaceAll(
        "journals.js",
        "https://isu1.khmnu.edu.ua/isu/dbsupport/students/journals.js",
      )
      .replaceAll(
        "../../js/extjs4/ext.js",
        "https://isu1.khmnu.edu.ua/isu/js/extjs4/ext.js",
      )
      .replaceAll(
        "../../js/extjs4/resources/css/ext-all.css",
        "https://isu1.khmnu.edu.ua/isu/js/extjs4/resources/css/ext-all.css",
      )
      .replaceAll(
        "jrn/css/journals.css",
        "https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/css/journals.css",
      ),
  );
});
