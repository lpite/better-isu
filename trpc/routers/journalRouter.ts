import { TRPCError } from "@trpc/server";
import { procedure, router } from "trpc/trpc";
import { db } from "utils/db";
import { refreshSubjectsList } from "utils/getSession";

import zod from "zod"

type Day = { RECORDBOOK: string, MONTHSTR: string, DAYNUM: string, CONTROLSHORTNAME: string, GRADE: string }

const monthList = [
	"Січень",
	"Лютий",
	"Березень",
	"Квітень",
	"Травень",
	"Червень",
	"Липень",
	"Серпень",
	"Вересень",
	"Жовтень",
	"Листопад",
	"Грудень",
	"Сем"
]

export const journalRouter = router({
	test: procedure.query(() => {
		return "test"
	}),
	get: procedure.input(zod.number()).query(async ({ ctx: { session }, input }) => {
		const query = { index: input }

		const user = await db.selectFrom("user")
			.select(["record_number", "group_id"])
			.where("id", "=", session.user_id)
			.executeTakeFirstOrThrow()

		const subjects = await db.selectFrom("subjects_list")
			.select(["data"])
			.where("user_id", "=", session.user_id)
			.executeTakeFirstOrThrow()


		const data = subjects.data as any;

		if (!data) {
			throw "no subjects list in db;";
		}
		// @ts-ignore
		if (!data[query.index]) {
			throw "no subjects list in db;";

		}

		// @ts-ignore
		let { link: journalLink, journalId, name: journalName } = data[query.index];

		if (!journalId) {
			let journalPage = await fetch(`https://isu1.khmnu.edu.ua/isu/dbsupport/students/journals.php?key=${journalLink}`, {
				headers: {
					"Cookie": `PHPSESSID=${session.isu_cookie}`,
				}
			})
				.then(res => res.text())

			
			if (journalPage.includes("Key violation")) {
				await refreshSubjectsList(session)

				throw new TRPCError({
					code: 'TIMEOUT',
				});
			}

			const obj = journalPage.split("'jrn.GradeGrid', {")[1].split("});")[0].trim().replaceAll("\t", "").split("\n");
			journalId = obj.map((el) => el.split("'")[1].split("'")[0])[2]
			// @ts-ignore
			data[query.index] = { ...data[query.index], journal_id: journalId }
			await db.updateTable("subjects_list")
				.set({
					data: JSON.stringify(data)
				})
				.where("user_id", "=", session.user_id)
				.executeTakeFirstOrThrow()
		}


		let grades = await fetch("https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/jrngrades.php", {
			headers: {
				"Cookie": `PHPSESSID=${session.isu_cookie}`,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			method: "POST",
			body: `grp=${user.group_id}&jrn=${journalId}&page=1&start=0&limit=25`
		})
			.then(res => res.json())
			.catch((err) => {
				console.error(err);
				return []
			}) as Day[]

		grades = grades.filter((el) => el.RECORDBOOK.trim() === user.record_number)
		const months: string[] = grades.reduce((prev, el) => {
			if (prev.indexOf(el.MONTHSTR.trim()) === -1) {
				return [...prev, el.MONTHSTR.trim()]
			}
			return prev
		}, [] as string[])
			.sort((a, b) => {
				const aIndex = monthList.indexOf(a);
				const bIndex = monthList.indexOf(b);

				if (aIndex > bIndex) {
					return 1
				}

				if (bIndex > aIndex) {
					return -1
				}
				return 0

			})

		return {
			months,
			grades,
			journalName
		}

	})
})