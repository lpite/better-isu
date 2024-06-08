import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment } from "react";
import { trpc } from "trpc/trpc-client";

export default function JournalPage() {
	const router = useRouter()

	const { data, isLoading, isError } = trpc.journal.get.useQuery(Number(router.query.index) || 0);

	if (isLoading) {
		return (
			<>
				<header className="p-2 flex">
					<Link href="/">
						<a className="px-1">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
								<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
							</svg>
						</a>
					</Link>
				</header>
				<main className="h-full flex items-center justify-center">
					<div className="flex w-full h-64 items-center justify-center">
						<div className="border-2 border-blue-600 p-4 rounded-full border-b-transparent animate-spin"></div>
					</div>
				</main>
			</>)
	}

	if (!data || isError) {
		return (
			<>
				<header className="p-2 flex">
					<Link href="/">
						<a className="px-1">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
								<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
							</svg>
						</a>
					</Link>
				</header>
				<main className="gap-1 p-2 flex items-center justify-center">
					<h1>Щось пішло не так :(</h1>
				</main>
			</>)
	}

	const { grades, months, journalName } = data
	return (
		<>
			<header className="p-2 flex">
				<Link href="/">
					<a className="px-1">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
							<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
						</svg>
					</a>
				</Link>
				<h1 className={`text-xl text-nowrap overflow-x-auto`}>{journalName}</h1>
			</header>
			<main className="gap-1 p-2">
				{months.map((m) => {
					const gradesForMonth = 
						grades.filter((d) => d.MONTHSTR.trim() === m)
							.sort((a, b) => {
								if (Number(a.DAYNUM) > Number(b.DAYNUM)) {
									return 1
								}
								if (Number(a.DAYNUM) < Number(b.DAYNUM)) {
									return -1
								}
								return 0
							})
					return (
						<Fragment key={m}>
							<h2 className="w-full text-2xl mb-0.5 mt-3">{m}</h2>
							<div className={`flex flex-row justify-start flex-wrap gap-1`}>
							
								{gradesForMonth.map((g, i) => (
									<Day key={i} date={g.DAYNUM} type={g.CONTROLSHORTNAME} grade={g.GRADE} />))
								}
							</div>
						</Fragment>
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
		"пр": "Практична",
		"др": "Домашнє",
		"ідз": "Домашнє",
		"злр": "Захист ЛР",
		"лр": "Лабораторна",
		"кр": "Контрольна",
		"тст": "Тест",
		"пз": "Практична",
		"пкз": "Підсумковий КЗ",
		"сем": "Семінарське",
		"<b>ат1</b>": "Атестація",
		"<b>по</b>": "Підсумкова",
	}



	return (
		<div style={{ width: "calc(33.33333333% - 3px)" }} className={`max-w-32 min-w-28 shrink-0 h-20 rounded flex flex-col py-1 px-1.5 dark:bg-slate-800 bg-slate-200`}>
			<div className="grow flex items-start justify-start">
				<span className="text-2xl dark:text-white grow">{date}</span>
				<span className={`text-3xl font-bold leading-none ${colors[grade]}`}>{types[type] === "Атестація" || types[type] === "Підсумкова" ? "?" : grade}</span>
			</div>
			<span className="dark:text-white leading-tight">{types[type.toLowerCase()]}</span>
		</div>
	)
}