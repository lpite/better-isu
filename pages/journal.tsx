// @ts-nocheck

import { GetServerSideProps } from "next"
import { db } from "utils/db";
import getSession from "utils/getSession"


export const getServerSideProps: GetServerSideProps = async ({
	req, query
}) => {
	
	const s = await getSession(req as any);
	if (!s.data) {
		return {
			redirect: {
				destination: "/login",
				statusCode: 200
			}
		}
	}

	const user = await db.selectFrom("user")
		.select(["record_number", "group_id"])
		.where("id", "=", s.data.user_id)
		.executeTakeFirstOrThrow()

	const subjects = await db.selectFrom("subjects_list")
		.select(["data"])
		.where("user_id", "=", s.data?.user_id)
		.executeTakeFirstOrThrow()

	const data = subjects.data as any;

	if (!data) {
		throw "no subjects list in db;";
	}

	if (!data[query.index]) {
		throw "no subjects list in db;";

	}

	let { link: journal_link, journal_id } = data[query.index];

	if (!journal_id) {
		let journalPage = await fetch(`https://isu1.khmnu.edu.ua/isu/dbsupport/students/journals.php?key=${journal_link}`, {
			headers: {
				"Cookie": `PHPSESSID=${s.data.isu_cookie}`,
			}
		})
			.then(res => res.text())	
		const obj = journalPage.split("'jrn.GradeGrid', {")[1].split("});")[0].trim().replaceAll("\t", "").split("\n");
		const [_, groupId, journalId] = obj.map((el) => el.split("'")[1].split("'")[0])
		journal_id = journalId;
		data[query.index] = { ...data[query.index], journal_id: journalId }
		await db.updateTable("subjects_list")
			.set({
				data: JSON.stringify(data)
			})
			.where("user_id", "=", s.data?.user_id)
			.executeTakeFirstOrThrow()
	}

	

	let grades = await fetch("https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/jrngrades.php", {
		headers: {
			"Cookie": `PHPSESSID=${s.data.isu_cookie}`,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		method: "POST",
		body: `grp=${user.group_id}&jrn=${journal_id}&page=1&start=0&limit=25`
	}).then(res => res.json())
	grades = grades.filter((el: any) => el.RECORDBOOK.trim() === user.record_number)
	const month = grades.reduce((prev, el) => {
		if (prev.indexOf(el.MONTHSTR.trim()) === -1) {
			return [...prev, el.MONTHSTR.trim()]
		}
		return prev
	}, [] as string[])
	console.log(grades)
	return {
		props: {
			days: grades,
			month
		}
	}
}

export default function JournalPage({ days, month }: any) {
	// const [days, setDays] = useState<{
	// 	CONTROLNAME: string,
	// 	ROWID: number,
	// 	STID: number,
	// 	CONTROLSHORTNAME: string,
	// 	GRADE: string,
	// 	MONTHSTR: string,
	// 	DAYNUM: string
	// }[]>([])

	// const [month, setMonth] = useState<string[]>([])

	// useEffect(() => {
	// 	fetch("http://localhost:49486/grades.json")
	// 		.then(res => res.json())
	// 		.then((res) => {

	// 			setDays(res.filter((el: any) => el.LFP.trim() === "Фаріон Олександр Сергійович"))
	// 			setMonth(res.filter((el: any) => el.LFP.trim() === "Фаріон Олександр Сергійович").reduce((prev, el) => {
	// 				if (prev.indexOf(el.MONTHSTR.trim()) === -1) {
	// 					return [...prev, el.MONTHSTR.trim()]
	// 				}
	// 				return prev
	// 			}, [] as string[]))


	// 		})
	// }, [])

	console.log(days)
	return (
		<main className="h-full gap-1 p-2">
			{month.map((m) => {
				const grades = days.filter((d) => d.MONTHSTR.trim() === m)
				return (
					<>
						<h2 className="w-full text-2xl mb-0.5 mt-3">{m}</h2>
						<div className={`flex flex-row justify-start flex-wrap gap-1`}>
							
							{grades.map((g, i) => (
								<Day key={i} date={g.DAYNUM} type={g.CONTROLSHORTNAME} grade={g.GRADE} />))
							}
						</div>
					</>
				)
			})}
		
		</main>
	)
}

type DayProps = {
	date: string,
	type: string,
	grade: string
}

function Day({
	date, type, grade
}: DayProps) {

	const colors: Record<string, string> = {
		"1": "bg-rose-400",
		"2": "bg-rose-300",
		"3": "bg-orange-300",
		"4": "bg-green-400",
		"5": "bg-emerald-400 dark:bg-emerald-300",
		"Н": "bg-slate-500",
		"В": "bg-slate-500",
		"Х": "bg-slate-500",
		"": "bg-slate-500",
	}

	const types: Record<string, string> = {
		"Пр": "Практична",
		"ДР": "Домашня",
		"ЗЛР": "Лаба",
		"ЛР": "Лаба",
		"КР": "Контрольна",
		"<b>Ат1</b>": "Атестація",
		"<b>ПО</b>": "Підсумкова",
	}



	return (
		<div className={`w-28 h-20  ${colors[grade]} rounded flex flex-col py-1 px-1.5`}>
			<span className="block text-3xl text-white">{date}</span>
			<div className="grow flex items-end justify-start">
				<span className="text-white grow leading-tight">{types[type]}</span>
				<span className="text-white text-lg font-bold leading-none">{types[type] === "Атестація" || types[type] === "Підсумкова" ? "?" : grade}</span>
			</div>
		</div>
	)
}