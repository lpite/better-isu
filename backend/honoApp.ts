import { OpenAPIHono } from "@hono/zod-openapi";
import { userRouter } from "./routers/userRouter";
import { generalRouter } from "./routers/generalRouter";
import { journalRouter } from "./routers/journalRouter";
import { authRouter } from "./routers/authRouter";
import { Hono } from "hono";
import { journalRoute } from "./routes/journal";
import { jrnRoute } from "./routes/jrn";
import { loginRoute } from "./routes/login";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";

export const openapiApp = new OpenAPIHono();
const apiApp = new Hono();
export const app = new Hono();

openapiApp.route("/user", userRouter);
openapiApp.route("/journal", journalRouter);
openapiApp.route("/general", generalRouter);
openapiApp.route("/auth", authRouter);

openapiApp.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Capybara",
  },
});

apiApp.route("/openapi", openapiApp);
apiApp.route("/journal", journalRoute);
apiApp.route("/jrn", jrnRoute);
apiApp.route("/login", loginRoute);

app.route("/api/hono", apiApp);

app.get(
  "*",
  serveStatic({
    root: "./dist",
    onNotFound(path, c) {},
  }),
);

app.notFound((c) => {
  return c.html(fs.readFileSync("./dist/index.html").toString());
});
