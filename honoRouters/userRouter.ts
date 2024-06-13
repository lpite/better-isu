import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { db } from 'utils/db'
import zod from "zod"
import { getCookie } from 'hono/cookie'

import { HTTPException } from "hono/http-exception"
export const userRouter = new OpenAPIHono()

userRouter.use(async (ctx, next) => {
	console.log('middleware 1 start')
	const sessionCookie = getCookie(ctx, "session");
	const unAuthed = new Response('Unauthorized', {
		status: 401,
		headers: {
		},
	})

	if (!sessionCookie) {
	
		throw new HTTPException(401, { res: unAuthed })
	}

	



	await next()

	console.log('middleware 1 end')
})

const profile = createRoute({
	path: "/profile",
	method: "get",
	responses: {
		200: {
			description: "user profile info",
			content: {
				"application/json": {
					schema: zod.object({
						name: zod.string(),
						surname: zod.string(),
						recordNumber: zod.string(),
						birthDate: zod.string()
					})
				}
			}
		}
	}
})

userRouter.openapi(profile, async (c) => {
	const userProfile = await db.selectFrom("user")
		.select([
			"name",
			"surname",
			"record_number as recordNumber",
			"birth_date as birthDate"
		])
		.where("user.id", "=", 1)
		.executeTakeFirstOrThrow()
	return c.json(userProfile)
})
