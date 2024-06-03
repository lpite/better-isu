import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import Link from "next/link";
import { db } from "utils/db";
import getSession, { refreshSubjectsList } from "utils/getSession"


type Day = { RECORDBOOK: string, MONTHSTR: string, DAYNUM: string, CONTROLSHORTNAME: string, GRADE: string }

export const getServerSideProps: GetServerSideProps = async ({
	req, query
}) => {
	
	const s = await getSession(req as any);

	if (s.error !== undefined) {
		return {
			redirect: {
				destination: "/login",
				permanent: false
			}
		}
	}

	if (!s.data) {
		return {
			redirect: {
				destination: "/login",
				permanent: false
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
	// @ts-ignore
	if (!data[query.index]) {
		throw "no subjects list in db;";

	}
	// @ts-ignore
	let { link: journal_link, journal_id, name } = data[query.index];

	if (!journal_id) {
		let journalPage = await fetch(`https://isu1.khmnu.edu.ua/isu/dbsupport/students/journals.php?key=${journal_link}`, {
			headers: {
				"Cookie": `PHPSESSID=${s.data.isu_cookie}`,
			}
		})
			.then(res => res.text())

			
		if (journalPage.includes("Key violation")) {
			await refreshSubjectsList(s.data)
			return {
				redirect: {
					destination: `/journal?index=${query.index}`,
					permanent: false
				}
			}
		}

		const obj = journalPage.split("'jrn.GradeGrid', {")[1].split("});")[0].trim().replaceAll("\t", "").split("\n");
		const journalId = obj.map((el) => el.split("'")[1].split("'")[0])[2]
		journal_id = journalId;
		// @ts-ignore
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
	})
		.then(res => res.json())
		.catch((err) => {
			console.error(err);
			return []
		}) as Day[]

	grades = grades.filter((el) => el.RECORDBOOK.trim() === user.record_number)
	const month: string[] = grades.reduce((prev, el) => {
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
		props: {
			journalName: name,
			days: grades,
			month: month
		}
	}
}

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


export default function JournalPage({ days, month, journalName }: { days: Day[], month: string[], journalName: string }) {
	
	return (
		<>
			<header className="p-2 flex">
				<Link href="/">
					<a className="p-2">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
							<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
						</svg>
					</a>
				</Link>
				<span className="text-xl">{journalName}</span>
			</header>
			<main className="gap-1 p-2">
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
		</>
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
		"1": "text-rose-400",
		"2": "text-rose-300",
		"3": "text-orange-300",
		"4": "text-green-400",
		"5": "text-emerald-400 dark:text-emerald-300",
		"Н": "text-slate-500",
		"В": "text-slate-500",
		"Х": "text-slate-500",
		"": "text-slate-500",
	}

	const types: Record<string, string> = {
		"Пр": "Практична",
		"ДР": "Домашнє",
		"ІДЗ": "Домашнє",
		"ЗЛР": "Лабораторна",
		"ЛР": "Лабораторна",
		"КР": "Контрольна",
		"Тст": "Тест",
		"ПЗ": "Практична",
		"ПКЗ": "Підсумковий КЗ",
		"<b>Ат1</b>": "Атестація",
		"<b>ПО</b>": "Підсумкова",
	}



	return (
		<div style={{ width: "calc(33.33333333% - 3px)" }} className={`max-w-32 min-w-28 shrink-0 h-20 rounded flex flex-col py-1 px-1.5 bg-slate-500`}>
			<div className="grow flex items-start justify-start">
				<span className="text-2xl text-white grow">{date}</span>
				<span className={`text-3xl font-bold leading-none ${colors[grade]}`}>{types[type] === "Атестація" || types[type] === "Підсумкова" ? "?" : grade}</span>
			</div>
			<span className="text-white  leading-tight">{types[type]}</span>
		</div>
	)
}