import { handle } from '@hono/node-server/vercel'

import { OpenAPIHono } from '@hono/zod-openapi'
import { userRouter } from 'honoRouters/userRouter'
// import userRouter from 'hono/userRouter'

const app = new OpenAPIHono().basePath('/api/hono')

console.log(userRouter.routes[0])
app.route("/user", userRouter)

app.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'Capybara',
  },
})

export default handle(app)
