import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { type CarouselApi } from "@/components/ui/carousel";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Checkbox } from "@/components/ui/checkbox";

import React, { useEffect } from "react";

import {
  useGetUserSchedule,
  useGetGeneralGetTypeOfWeek,
  GetUserScheduleQueryResult,
  GetUserSubjectsQueryResult,
} from "orval/default/default";

function generateSubjectsList(schedule?: GetUserScheduleQueryResult) {
  if (!schedule) {
    return [];
  }

  const teacherRegex = /[А-Яа-яІіЇїЄє]+\s[А-ЯІЇїЄє]\.[А-ЯІіЇїЄє]\./gim;
  const setOfName = new Set<string>();
  schedule.forEach((el) => {
    const indexOfFirstDot = el.name.indexOf(".");
    const newName = el.name
      .replace(teacherRegex, "")
      .slice(indexOfFirstDot + 1)
      .trim();
    const indexOfLastSpace = newName.lastIndexOf(" ");
    setOfName.add(newName.slice(0, indexOfLastSpace));
  });
  return [...setOfName];
}

const scheduleTimes: Record<string, string> = {
  "1": "8:00 - 9:20",
  "2": "9:35 - 10:55",
  "3": "11:10 - 12:30",
  "4": "13:00 - 14:20",
  "5": "14:35 - 15:55",
  "6": "16:10 - 17:30",
  "7": "17:45 - 19:05",
  "8": "19:20 - 20:40",
};

type ScheduleCarouselProps = {
  subjects?: GetUserSubjectsQueryResult;
};

export default function ScheduleCarousel({
  subjects = [],
}: ScheduleCarouselProps) {
  const [enabledSubjects, setEnabledSubjects] = React.useState<string[]>([]);
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();

  const { data: schedule, isLoading: isLoadingSchedule } = useGetUserSchedule();

  const { data: currentWeekType } = useGetGeneralGetTypeOfWeek();

  React.useEffect(() => {
    const storedEnabledSubjects = (JSON.parse(
      localStorage.getItem("enabledSubjects") || "[]",
    ) || []) as string[];
    if (!storedEnabledSubjects.length) {
      const subjectNames = subjects.map((el) => el.name);
      localStorage.setItem("enabledSubjects", JSON.stringify(subjectNames));
      setEnabledSubjects(subjectNames);
    } else {
      if (!enabledSubjects.length) {
        setEnabledSubjects(storedEnabledSubjects);
      }
    }
  }, [subjects]);

  React.useEffect(() => {
    if (!carouselApi) {
      return;
    }
    if (!carouselApi) {
      return;
    }
    const currentWeekDay = new Date().getDay() - 1;

    carouselApi.scrollTo(currentWeekDay);
  }, [carouselApi]);

  function toggleSubject(state: boolean | string, subjectName: string) {
    if (state) {
      if (enabledSubjects?.indexOf(subjectName) === -1) {
        setEnabledSubjects((state) => [...state, subjectName]);
      }
    } else {
      if (enabledSubjects?.indexOf(subjectName) !== -1) {
        const indexOfSubject = enabledSubjects?.indexOf(subjectName);
        setEnabledSubjects((state) => [
          ...state.slice(0, indexOfSubject),
          ...state.slice(indexOfSubject + 1),
        ]);
      }
    }
  }

  useEffect(() => {
    if (enabledSubjects.length) {
      localStorage.setItem("enabledSubjects", JSON.stringify(enabledSubjects));
    }
  }, [enabledSubjects]);

  function isEnabled(subjName: string) {
    if (enabledSubjects.findIndex((el) => subjName.includes(el)) !== -1) {
      return true;
    }

    return false;
  }

  return (
    <div className="flex flex-col align-center justify-center grow w-full relative">
      <h2 className="text-xl font-bold mb-2 mt-4">Розклад</h2>

      <Sheet>
        <SheetTrigger className="absolute right-2 top-0 mt-4 text-slate-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
            />
          </svg>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-96 overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Предмети які показувати в розкладі</SheetTitle>
          </SheetHeader>
          {generateSubjectsList(schedule).map((subject) => (
            <label
              key={subject}
              className="flex items-center gap-3 my-1 px-2 py-3 border rounded-lg"
            >
              <Checkbox
                checked={Boolean(enabledSubjects?.find((el) => el === subject))}
                onCheckedChange={(state) => toggleSubject(state, subject)}
              />
              <span>{subject}</span>
            </label>
          ))}
        </SheetContent>
      </Sheet>

      <Carousel className="relative" setApi={setCarouselApi}>
        <CarouselContent className="mt-8">
          {["Пн", "Вт", "Ср", "Чт", "Пт"].map((day) => {
            if (isLoadingSchedule) {
              return (
                <CarouselItem className="flex flex-col" key={day}>
                  <span>{day}</span>
                  <div className="flex w-full h-64 items-center justify-center">
                    <div className="border-2 border-blue-600 p-4 rounded-full border-b-transparent animate-spin"></div>
                  </div>
                </CarouselItem>
              );
            }

            if (!enabledSubjects.length) {
              return (
                <CarouselItem className="flex flex-col" key={day}>
                  <span>{day}</span>
                  <div className="flex w-full h-36 items-center justify-center">
                    Потрібно обрати предмети які показувати в розкладі
                  </div>
                </CarouselItem>
              );
            }

            let scheduleForDay =
              schedule
                ?.filter((el) => el.day === day)
                .filter((subj) => isEnabled(subj.name))
                .filter(
                  ({ type }) => type === "full" || type === currentWeekType,
                )
                .filter(({ dateFrom, dateTo }) => {
                  return true;
                  // Це вимкнена перевірка закінчення предмету
                  if (!dateFrom || !dateTo) {
                    return true;
                  }
                  const currentMonth = new Date().getMonth() + 1;
                  const currentDay = new Date().getDate();

                  const [fromDay, fromMonth] = dateFrom.split(".");
                  const [toDay, toMonth] = dateTo.split(".");

                  if (
                    Number(fromMonth) <= currentMonth &&
                    Number(fromDay) <= currentDay &&
                    Number(toMonth) >= currentMonth &&
                    Number(toDay) >= currentDay
                  ) {
                    return true;
                  }

                  return false;
                }) || [];

            if (day === "Пт") {
              // спеціально для пʼятниці розклад
              // і так це максимально погано і маскимально криво :))

              const s = [
                { date: "06.09", type: "up", day: "Пн" },
                { date: "13.09", type: "up", day: "Вт" },
                { date: "20.09", type: "up", day: "Ср" },
                { date: "27.09", type: "up", day: "Чт" },
                { date: "04.10", type: "bottom", day: "Пн" },
                { date: "11.10", type: "bottom", day: "Вт" },
                { date: "18.10", type: "bottom", day: "Ср" },
                { date: "25.10", type: "bottom", day: "Чт" },
                { date: "01.11", type: "up", day: "Пн" },
                { date: "08.11", type: "up", day: "Вт" },
                { date: "15.11", type: "up", day: "Ср" },
                { date: "22.11", type: "up", day: "Чт" },
              ];
              const currentWeekDay = new Date().getDay();
              const off = 5 - currentWeekDay;
              const d = Date.now() + off * 24 * 60 * 60 * 1000;
              const fridayDate = new Date(d);

              const scheduleForFriday = s.find((el) => {
                const [d, m] = el.date.split(".");
                if (
                  fridayDate.getMonth() + 1 === parseInt(m) &&
                  fridayDate.getDate() === parseInt(d)
                ) {
                  return true;
                }
                return false;
              });

              scheduleForDay =
                schedule
                  ?.filter((el) => el.day === scheduleForFriday?.day)
                  .filter((subj) => isEnabled(subj.name))
                  .filter(
                    ({ type }) =>
                      type === "full" || type === scheduleForFriday?.type,
                  ) || [];
            }

            if (!scheduleForDay.length && !isLoadingSchedule) {
              return (
                <CarouselItem className="flex flex-col h-72" key={day}>
                  <span>{day}</span>
                  <div className="flex w-full h-full items-center justify-center">
                    Вільний день :)
                  </div>
                </CarouselItem>
              );
            }

            return (
              <CarouselItem className="flex flex-col" key={day}>
                <span>{day}</span>
                {scheduleForDay?.map((row, i) => (
                  <div
                    key={day + i}
                    className="rounded-lg box-border border pb-3 pt-1 px-2 my-1"
                  >
                    <span className="text-slate-500">
                      #{row.number} {scheduleTimes[row.number]}
                    </span>
                    <br />
                    {row.name}
                  </div>
                ))}
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="absolute top-3 left-0" />
        <CarouselNext className="absolute top-3 left-10" />
      </Carousel>
    </div>
  );
}
