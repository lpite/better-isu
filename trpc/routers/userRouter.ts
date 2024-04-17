import { sql } from "kysely";
import { procedure, router } from "trpc/trpc";
import { db } from "utils/db";
import { refreshSubjectsList } from "utils/getSession";

export const userRouter = router({
	profile: procedure.query(async ({ ctx }) => {
		const userProfile = await db.selectFrom("user")
			.select([
				"name",
				"record_number as recordNumber",
				"birth_date as birthDate"
			])
			.where("user.id", "=", ctx.session.user_id)
			.executeTakeFirstOrThrow()
		return userProfile
	}),
	subjects: procedure.query(async ({ ctx }) => {
		const subjects = await db.selectFrom("subjects_list")
			.select([sql<{ name: string, link: string }[] | string>`data`.as("data")])
			.where("user_id", "=", ctx.session.user_id)
			.executeTakeFirst()
		if (!subjects || !subjects?.data?.length) {
			await refreshSubjectsList(ctx.session)
			return [] as { name: string, link: string }[]
		}

		if (typeof subjects.data === "string") {
			return JSON.parse(subjects.data.toString()) as { name: string, link: string }[]

		}

		return subjects?.data as { name: string, link: string }[]
	}),
	schedule: procedure.query(async ({ ctx }) => {
		const user = await db.selectFrom("user")
			.select("group")
			.where("id", "=", ctx.session.user_id)
			.executeTakeFirstOrThrow();

		const schedule = await db.selectFrom("schedule")
			.select(["data"])
			.where("group", "=", user.group)
			.executeTakeFirstOrThrow();

		return schedule.data as { name: string, day: string, number: string, type: "full" | "up" | "bottom" }[]
	})

})