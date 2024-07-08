import { handle } from '@hono/node-server/vercel'

import { app } from 'backend/honoApp'


export default handle(app)
