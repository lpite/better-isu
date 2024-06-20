import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { db } from 'utils/db'
import { z as zod } from "@hono/zod-openapi"
import { Session } from 'types/session'
import { sessionMiddleware } from 'backend/middlewares/sessionMiddleware'
import { sql } from 'kysely'
import { refreshSubjectsList } from 'utils/getSession'
import getRaitingPage from 'utils/getRaitingPage'

export const userRouter = new OpenAPIHono<{ Variables: { session: Session } }>();

userRouter.use(sessionMiddleware)

const profile = createRoute({
	method: "get",
	path: "/profile",
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
	const session = c.get("session")
	const userProfile = await db.selectFrom("user")
		.select([
			"name",
			"surname",
			"record_number as recordNumber",
			"birth_date as birthDate"
		])
		.where("user.id", "=", session.user_id)
		.executeTakeFirstOrThrow()
	return c.json(userProfile)
})

const subjects = createRoute({
	path: "/subjects",
	method: "get",
	responses: {
		200: {
			description: "subjects for user",
			content: {
				"application/json": {
					schema: zod.array(
						zod.object({
							link: zod.string(),
							name: zod.string()
						})
					)
				}
			}
		}	
	}
})

userRouter.openapi(subjects, async (c) => {

	const session = c.get("session");
	const subjects = await db.selectFrom("subjects_list")
		.select([sql<{ name: string, link: string }[] | string>`data`.as("data")])
		.where("user_id", "=", session.user_id)
		.executeTakeFirst()

	if (!subjects || !subjects?.data?.length) {
		const subjects = await refreshSubjectsList(session)
		if (!subjects) {
			return c.json([])
		}
		return c.json(subjects);
	}

	if (typeof subjects.data === "string") {
		return c.json(JSON.parse(subjects.data.toString()))
	}
	
	return c.json(subjects.data)
})

const schedule = createRoute({
	path: "/schedule",
	method: "get",
	responses: {
		200: {
			description: "schedule for user",
			content: {
				"application/json": {
					schema: zod.array(
						zod.object({
							name: zod.string(),
							day: zod.string(),
							number: zod.string(),
							type: zod.enum(["up", "bottom", "full"]),
							dateFrom: zod.string(),
							dateTo: zod.string()
						})
					)
				}
			}
		}
	}
})

userRouter.openapi(schedule, async (c) => {
	const session = c.get("session");

	const user = await db.selectFrom("user")
		.select("group")
		.where("id", "=", session.user_id)
		.executeTakeFirstOrThrow();

	const schedule = await db.selectFrom("schedule")
		.select(["data"])
		.where("group", "=", user.group)
		.executeTakeFirstOrThrow();

	return c.json(schedule.data as any)
})


const rating = createRoute({
	path: "rating",
	method: "get",
	responses: {
		200: {
			description: "returns rating for user",
			content: {
				"application/json": {
					schema: zod.array(zod.object({
						number: zod.string(),
						name: zod.string(),
						surname: zod.string(),
						rating: zod.string(),
						type: zod.string(),
						group: zod.string()
					}))
				}
			}
		}
	}
})

userRouter.openapi(rating, async (c) => {
	const session = c.get("session")
	const rating = await getRaitingPage(session);
	c.header("Cache-Control", "max-age=14400");
	return c.json(rating)
})
