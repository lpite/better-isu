import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z as zod } from "@hono/zod-openapi";
import { Session } from "types/session";
import { sessionMiddleware } from "backend/middlewares/sessionMiddleware";
import fetchAndDecode from "utils/fetchAndDecode";

export const generalRouter = new OpenAPIHono<{
  Variables: { session: Session };
}>();

generalRouter.use(sessionMiddleware);

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
  c.header("Cache-Control", "max-age=14400");
  const { html } = await fetchAndDecode("https://isu1.khmnu.edu.ua/isu/");
  const typeOfWeek = html
    .querySelector(".logo-time")
    ?.textContent.split(".")[1]
    .trim();

  if (typeOfWeek === "Знаменник") {
    return c.text("bottom");
  }
  return c.text("up");
});
