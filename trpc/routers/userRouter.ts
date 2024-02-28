import { sql } from "kysely";
import { procedure, router } from "trpc/trpc";
import { db } from "utils/db";
import { getProfilePage } from "utils/getPage";
import { refreshSubjectsList } from "utils/getSession";

export const userRouter = router({
	profile: procedure.query(({ ctx }) => {
		return getProfilePage(ctx.session)
	}),
	subjects: procedure.query(async ({ ctx }) => {
		const subjects = await db.selectFrom("subjects_list")
			.select([sql<string>`data`.as("data")])
			.where("user_id", "=", ctx.session.user_id)
			.executeTakeFirst()
		if (!subjects) {
			await refreshSubjectsList(ctx.session)
			return [] as { name: string, link: string }[]
		}
		return JSON.parse(subjects?.data) as { name: string, link: string }[]
	})
})