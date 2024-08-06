import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z as zod } from "@hono/zod-openapi";
import { Session } from "types/session";
import { sessionMiddleware } from "backend/middlewares/sessionMiddleware";
import fetchAndDecode from "utils/fetchAndDecode";
import { cacheClient } from "utils/memcached";

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
  const cachedWeekType = await cacheClient.get<string>("week_type").then((res)=>{
    return res?.value
  }).catch((err)=>{
    console.error(err)
    return undefined
  })
  if(cachedWeekType){
    return c.text(cachedWeekType)
  }

  const { html } = await fetchAndDecode("https://isu1.khmnu.edu.ua/isu/");
  const typeOfWeek = html
    .querySelector(".logo-time")
    ?.textContent.split(".")[1]
    .trim();
  let response: "up" | "bottom" = "up";
  if (typeOfWeek === "Знаменник") {
    response = "bottom";
  }
  cacheClient.set("week_type", response, { lifetime: 60 * 60 });
  return c.text(response);
});
