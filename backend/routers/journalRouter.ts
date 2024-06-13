import { OpenAPIHono, createRoute, z as zod } from "@hono/zod-openapi";
import { Session } from "types/session";
import getGradesForUser, { DaySchema } from "utils/getGradesForUser";
import { db } from "utils/db";
import { refreshSubjectsList } from "utils/getSession";
import parse from "node-html-parser";
import { sessionMiddleware } from "backend/middlewares/sessionMiddleware";

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

export const journalRouter = new OpenAPIHono<{ Variables: { session: Session } }>();
journalRouter.use(sessionMiddleware)

const get = createRoute({
	path: "/get",
	method: "get",
	request: {
		query: zod.object({
			index: zod.string()
		})
	},
	responses: {
		200: {
			description: "grades for user",
			content: {
				"application/json": {
					schema: zod.object({
						journalName: zod.string(),
						months: zod.array(zod.object({
							name: zod.string(),
							grades: zod.array(DaySchema)
						}))
					})
				}
			}
		}
	}
})

journalRouter.openapi(get, async (c) => {
	const session = c.get("session")

	const {
		index
	} = c.req.valid("query")
	
	const query = { index: Number(index) }
console.log("index= ====", session)
	const user = await db.selectFrom("user")
		.select(["record_number", "group_id"])
		.where("id", "=", session.user_id)
		.executeTakeFirstOrThrow()

	const subjects = await db.selectFrom("subjects_list")
		.select(["data"])
		.where("user_id", "=", session.user_id)
		.executeTakeFirstOrThrow()


	const data = subjects.data as { link: string, name: string, journal_id?: string, weights: { type: string, weight: string, isRequired: boolean }[] }[];

	if (!data) {
		throw "no subjects list in db;";
	}
	// @ts-ignore
	if (!data[query.index]) {
		throw "no subjects list in db;";

	}

	let { link: journalLink, journal_id: journalId, name: journalName, weights } = data[query.index]

	if (!journalId) {
		let journalPage = await fetch(`https://isu1.khmnu.edu.ua/isu/dbsupport/students/journals.php?key=${journalLink}`, {
			headers: {
				"Cookie": `PHPSESSID=${session.isu_cookie}`,
			}
		})
			.then(res => res.text())

			
		if (journalPage.includes("Key violation")) {
			await refreshSubjectsList(session)

			// throw new TRPCError({
			// 	code: 'TIMEOUT',
			// });
		}

		const obj = journalPage.split("'jrn.GradeGrid', {")[1].split("});")[0].trim().replaceAll("\t", "").split("\n");
		journalId = obj.map((el) => el.split("'")[1].split("'")[0])[2];

		const html = parse(journalPage);

		const weights = html.querySelector("table")
			?.querySelectorAll("tr")
			.slice(2)
			.map(el => { 
				const line = el.textContent.trim().split("\n\t\t") 
				const type = line[0];
				const isRequired = line[2] === "Так" ? true : false;
					
				const weight = line[3]

				return { type, weight, isRequired }
			}) || []


		// @ts-ignore
		data[query.index] = { ...data[query.index], journal_id: journalId, weights }
		await db.updateTable("subjects_list")
			.set({
				data: JSON.stringify(data)
			})
			.where("user_id", "=", session.user_id)
			.executeTakeFirstOrThrow()
	}

	const grades = await getGradesForUser({
		isu_cookie: session.isu_cookie,
		groupId: user.group_id,
		journalId,
		recordNumber: user.record_number
	})

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
	const pairsCountByType: Record<string, number> = {}
	const sumByType: Record<string, number> = {}

	const monthsWithGrades = months.map((month) => {
		const gradesForMonth = 
			grades.filter((d) => d.MONTHSTR.trim() === month)
				.sort((a, b) => {
					if (Number(a.DAYNUM) > Number(b.DAYNUM)) {
						return 1
					}
					if (Number(a.DAYNUM) < Number(b.DAYNUM)) {
						return -1
					}
					return 0
				})


		for (let i = 0; i < gradesForMonth.length; i++) {
			let { CONTROLSHORTNAME, GRADE } = gradesForMonth[i];

			if (CONTROLSHORTNAME === "<b>Ат1</b>" || CONTROLSHORTNAME === "<b>ПО</b>") {
				let grade = 0;
				let currentSumOfWeights = 0;
				Object.entries(sumByType).forEach(([key, sum]) => {
					const {
						weight: weightString,
						isRequired
					} = weights.find(el => el.type === key) || { weight: "0", isRequired: false }

					const weight = Number(weightString)

					const count = pairsCountByType[key]
					const average = sum / count;
					console.log(key, average, sum, count, weight)
					grade += average * weight;
					console.log(grade)
					if (average * weight || isRequired) {
						// перевірка якщо оцінка 0 то не враховувати ваговий в розрахунках
						// Враховувати завжди якщо вид заняття обовʼязковий
						currentSumOfWeights += weight;
					}


				})
				console.log(currentSumOfWeights)
				grade = grade / currentSumOfWeights

				gradesForMonth[i].GRADE = grade.toFixed(2)
				// console.log(pairsCountByType, sumByType)
				continue;

			}
			const pairAttributes = weights.find(el => el.type === CONTROLSHORTNAME)

			if (!pairAttributes?.isRequired && !GRADE.length) {
				continue;
			}

			if (pairsCountByType[CONTROLSHORTNAME]) {
				pairsCountByType[CONTROLSHORTNAME] = pairsCountByType[CONTROLSHORTNAME] + 1
			} else {
					
				pairsCountByType[CONTROLSHORTNAME] = 1
			}
			if (Number(GRADE) < 3) {
				GRADE = "0"
			}
			if (!sumByType[CONTROLSHORTNAME]) {
				sumByType[CONTROLSHORTNAME] = (Number(GRADE) || 0)
			} else {
				sumByType[CONTROLSHORTNAME] += (Number(GRADE) || 0)
			}
		}
		return {
			name: month,
			grades: gradesForMonth
		}

	})
	return c.json({
		months: monthsWithGrades,
		journalName
	})

})