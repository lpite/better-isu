import { handle } from '@hono/node-server/vercel'

import { OpenAPIHono } from '@hono/zod-openapi'
import { userRouter } from 'backend/routers/userRouter'
import { generalRouter } from 'backend/routers/generalRouter'
import { journalRouter } from 'backend/routers/journalRouter'
import { authRouter } from 'backend/routers/authRouter'

const app = new OpenAPIHono().basePath('/api/hono')

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

export default handle(app)
