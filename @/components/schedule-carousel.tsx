import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel"

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"

import { Checkbox } from "@/components/ui/checkbox"

import React from "react";
import { RouterOutput } from "trpc/router";

import { trpc } from "trpc/trpc-client";


function generateSubjectsList(schedule?: RouterOutput["user"]["schedule"]) {

	if (!schedule) {
		return []
	}

	const teacherRegex = /[А-Яа-яІіЇїЄє]+\s[А-ЯІЇїЄє]\.[А-ЯІіЇїЄє]\./gim
	const setOfName = new Set<string>();
	schedule.forEach((el) => {
		const indexOfFirstDot = el.name.indexOf(".");
		const newName = el.name.replace(teacherRegex, "").slice(indexOfFirstDot + 1).trim();
		const indexOfLastSpace = newName.lastIndexOf(" ");
		setOfName.add(newName.slice(0, indexOfLastSpace));
	})
	return [...setOfName]

}

export default function ScheduleCarousel() {

	const {
		data: schedule,
		isLoading: isLoadingSchedule,
	} = trpc.user.schedule.useQuery()

	React.useEffect(() => {
		if (schedule) {

			generateSubjectsList(schedule)
		}
	}, [])
	return (
		<div className="flex flex-col align-center justify-center grow w-full relative">
			<h2 className='text-xl font-bold mb-2 mt-4'>Розклад</h2>

			<Sheet>
				<SheetTrigger className="absolute right-2 top-0 mt-4 text-slate-400">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
						<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
					</svg>
				</SheetTrigger>
				<SheetContent side="bottom">
					<SheetHeader className="mb-4">
						<SheetTitle>Предмети які показувати в розкладі</SheetTitle>
					</SheetHeader>
					{generateSubjectsList(schedule).map((el) => (
						<label key={el} className="flex items-center gap-3 my-1 px-2 py-3 border rounded-lg">
							<Checkbox />
							<span>{el}</span>
						</label>
					))}
				</SheetContent>
			</Sheet>


			<Carousel className="mx-12">
				<CarouselContent>
					{["Пн", "Вт", "Ср", "Чт", "Пт"].map((day) => (
						<CarouselItem className="flex flex-col" key={day}>
							<span>{day}</span>
							{schedule?.filter(el => el.day === day).map((row, i) => (
								<div key={day + i} className="rounded-lg box-border border py-3 px-2 my-1">{row.name}</div>
							))}
						</CarouselItem>

					))}
				</CarouselContent>
				<CarouselPrevious />
				<CarouselNext />		
			</Carousel>
		</div>
	);
}