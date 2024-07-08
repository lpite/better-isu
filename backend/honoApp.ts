import { OpenAPIHono } from "@hono/zod-openapi"
import { userRouter } from "./routers/userRouter"
import { generalRouter } from "./routers/generalRouter"
import { journalRouter } from "./routers/journalRouter"
import { authRouter } from "./routers/authRouter"

export const app = new OpenAPIHono().basePath('/api/hono')

app.route("/user", userRouter)
app.route("/journal", journalRouter)
app.route("/general", generalRouter)
app.route("/auth", authRouter)

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Capybara',
  },
})
