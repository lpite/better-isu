import { OpenAPIHono } from "@hono/zod-openapi";
import { userRouter } from "./routers/userRouter";
import { generalRouter } from "./routers/generalRouter";
import { journalRouter } from "./routers/journalRouter";
import { authRouter } from "./routers/authRouter";
import { Hono } from "hono";
import { journalRoute } from "./routes/journal";
import { jrnRoute } from "./routes/jrn";

export const openapiApp = new OpenAPIHono();

export const app = new Hono().basePath("/api/hono");

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

app.route("/openapi", openapiApp);
app.route("/journal", journalRoute);
app.route("/jrn", jrnRoute);

