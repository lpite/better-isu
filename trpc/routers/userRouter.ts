import { sql } from "kysely";
import { procedure, router } from "trpc/trpc";
import { db } from "utils/db";
import { getProfilePage, getSubjectsPage } from "utils/getPage";

export const userRouter = router({
	profile: procedure.query(({ ctx }) => {
		// @ts-ignore

		return getProfilePage(ctx.session)
	}),
	subjects: procedure.query(async ({ ctx }) => {
		const subjects = await db.selectFrom("subjects_list")
			.select([sql<string>`data`.as("data")])
			.where("user_id", "=", ctx.session.user_id)
			.executeTakeFirst()
		if (!subjects) {
			return [] as { name: string, link: string }[]
		}
		return JSON.parse(subjects?.data) as { name: string, link: string }[]
	})
})