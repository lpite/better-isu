import { createMiddleware } from "hono/factory"

import { getCookie } from 'hono/cookie'

import { HTTPException } from "hono/http-exception"
import { Context } from 'hono'
import { refreshSchedule, refreshSubjectsList, refreshUserInfo } from 'utils/getSession'
import refreshSession from 'utils/refreshSession'
import { db } from "utils/db"
import { Session } from "types/session"

export async function getSession(ctx: Context): Promise<{
	error?: "unauthorized" | "no session",
	data: Session | null
}> {
	const sessionCookie = getCookie(ctx, "session");

	if (!sessionCookie) {
		return {
			error: "unauthorized",
			data: null
		}
	}

	const session = await db.selectFrom("session")
		.selectAll()
		.where("session_id", "=", sessionCookie)
		.executeTakeFirst();
	

	if (!session) {
		console.error("no such session db (sessionMiddleware)")
		return {
			error: "unauthorized",
			data: null
		}
	
	}
	const now = new Date().getTime() - (new Date().getTimezoneOffset() * 60);
	if ((now - session.created_at.getTime() > 55 * 60 * 1000)) {
		const { numInsertedOrUpdatedRows: isNotUpdating } = await db.insertInto("session_update_state")
			.values({
				session: sessionCookie
			})

			.executeTakeFirst().catch(() => {
				return {
					insertId: undefined,
					numInsertedOrUpdatedRows: 0
				}
			})
			
		if (isNotUpdating) {
			const newSession = await refreshSession(session, getCookie(ctx));
			if (!newSession) {
				console.error("no new session created")
				await db.deleteFrom("session_update_state")
					.where("session", "=", sessionCookie)
					.execute()
				return {
					error: "unauthorized",
					data: null

				}
			}

			await Promise.all([
				refreshUserInfo(newSession),
				refreshSubjectsList(newSession),
				refreshSchedule(newSession),
				db.deleteFrom("session_update_state")
					.where("session", "=", sessionCookie)
					.execute()
			])

			return {
				data: newSession
			}
		}

		
	}
	return {
		data: session
	}
}

export const sessionMiddleware = createMiddleware(async (c, next) => {

	const session = await getSession(c);
	if (session.error || !session.data) {
		const res = new Response('Unauthorized', {
			status: 401
		})
		throw new HTTPException(401, { res })
	}
	c.set("session", session.data)
	await next()
}) 