import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment } from "react";

import { useGetJournalGet } from "orval/default/default"
import PageHeader from "@/components/page-header";
import PageBackButton from "@/components/page-back-button";
import ProtectedRoute from "@/components/protected-route";
export default function JournalPage() {
	const router = useRouter()
	const { data, isLoading, error, mutate } = useGetJournalGet({ index: router.query.index?.toString() || "jopa" }, {
		swr: {
			revalidateIfStale: true,
			revalidateOnMount: true,
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
			onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
				if (retryCount >= 10) return
				setTimeout(() => revalidate({ retryCount }), 300)
			}
		}
	});


	if (isLoading) {
		return (
			<>
				<ProtectedRoute />

				<PageHeader name="" />
				<main className="h-full flex items-center justify-center">
					<div className="flex w-full h-64 items-center justify-center">
						<div className="border-2 border-blue-600 p-4 rounded-full border-b-transparent animate-spin"></div>
					</div>
				</main>
			</>)
	}

	if (!data || error) {
		return (
			<>
				<ProtectedRoute />

				<PageHeader name="" />
				<main className="gap-1 p-2 flex items-center justify-center">
					<h1>Щось пішло не так :(</h1>
					<div className="fixed bottom-0 left-0 right-0 flex items-center justify-center h-12 border-t-2 bg">
						<Link href="/">
							<a className="pl-2 pr-4">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 inline mr-3">
									<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
								</svg>
								<span className="inline">Повернутися</span>
							</a>
						</Link>
					</div>
				</main>
			</>)
	}

	const { months, journalName } = data
	return (
		<>
			<ProtectedRoute />

			<PageHeader name={journalName} />

			<main className="gap-1 p-2 pb-14">
				{months.map((m) => {
					const gradesForMonth = m.grades 
						
					return (
						<Fragment key={m.name}>
							<h2 className="w-full text-2xl mb-0.5 mt-3">{m.name}</h2>
							<div className={`grid grid-cols-3 gap-1`}>
								{gradesForMonth.map((g, i) => (
									<Day key={m.name + i} date={g.DAYNUM} type={g.CONTROLSHORTNAME} grade={g.GRADE} />))
								}
							</div>
						</Fragment>
					)
				})}
				<PageBackButton backButtonLink="/" />
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
		"пз": "Практична",
		"др": "Домашнє",
		"ідз": "Домашнє",
		"злр": "Захист ЛР",
		"лр": "Лабораторна",
		"кр": "Контрольна",
		"лк": "Лекція",
		"тст": "Тест",
		"пкз": "Підсумковий КЗ",
		"пкр": "Підсумковий КЗ",
		"сем": "Семінарське",
		"<b>ат1</b>": "Атестація",
		"<b>по</b>": "Підсумкова",
	}



	return (
		<div className={`min-w-28 shrink-0 h-20 rounded flex flex-col py-1 px-1.5 dark:bg-gray-800 bg-slate-200`}>
			<div className="grow flex items-start justify-start">
				<span className="text-2xl dark:text-white grow">{date}</span>
				<span className={`text-3xl font-bold leading-none ${colors[isNaN(Number(grade)) ? grade : Math.floor(Number(grade))]}`}>{grade}</span>
			</div>
			<span className="dark:text-white leading-tight">{types[type.toLowerCase()] || type}</span>
		</div>
	)
}