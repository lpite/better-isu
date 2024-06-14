import { OpenAPIHono, createRoute, z as zod } from "@hono/zod-openapi";
import { getSession } from "backend/middlewares/sessionMiddleware";
import { getCookie } from "hono/cookie"
import { Session } from "types/session";

export const authRouter = new OpenAPIHono<{ Variables: { session: Session } }>();


const getSessionRoute = createRoute({
	path: "session",
	method: "get",
	responses: {
		200: {
			description: "returns session for user",
			content: {
				"application/json": {
					schema: zod.object({
						data: zod.object({
							session_id: zod.string(),
							created_at: zod.string()
						})
					})
				}
			}
		},
		401: {
			description: "returns error if no session cookie or no session in db",
			content: {
				"application/json": {
					schema: zod.object({ error: zod.string() })
				}
			}
			
		}
	},

})

authRouter.openapi(getSessionRoute, async (c) => {
	const sessionCookie = getCookie(c, "session");

	if (!sessionCookie) {
		return c.json({
			error: "no session"
		}, 401)
	}

	const session = await getSession(c);

	if (!session.data || session.error || !session.data.isu_cookie) {
		return c.json({
			error: "no session"
		}, 401)
	}

	const temp = {
		session_id: session.data.isu_cookie,
		created_at: session.data.created_at
	}

	return c.json({
		data: temp
	}, 200)
})


const logout = createRoute({
	path: "logout",
	method: "post",
	responses: {
		200: {
			description: "success logout"
		}
	}
})


authRouter.openapi(logout, async (c) => {
	c.header("Set-Cookie", `session=;Max-Age=0;HttpOnly;Path=/`);
	return c.json({})
})