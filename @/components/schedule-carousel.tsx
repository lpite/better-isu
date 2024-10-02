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
  useGetUserIndividualPlan,
} from "orval/default/default";

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

// версія
const ENABLED_SUBJECTS_KEY = "enabledSubjects_v2";

export default function ScheduleCarousel({
  subjects = [],
}: ScheduleCarouselProps) {
  const [enabledSubjects, setEnabledSubjects] = React.useState<string[]>([]);
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();

  const { data: schedule, isLoading: isLoadingSchedule } = useGetUserSchedule();
  const { data: individualPlan, isLoading: isLoadingPlan } =
    useGetUserIndividualPlan({
      swr: {
        errorRetryCount: 4,
        errorRetryInterval: 300,
      },
    });

  React.useEffect(() => {
    const storedEnabledSubjects = (JSON.parse(
      localStorage.getItem(ENABLED_SUBJECTS_KEY) || "[]",
    ) || []) as string[];
    if (!storedEnabledSubjects.length) {
      // це має зробити індивідуальний план
      // const subjectNames = subjects.map((el) => el.name);
      // localStorage.setItem(ENABLED_SUBJECTS_KEY, JSON.stringify(subjectNames));
      // setEnabledSubjects(subjectNames);
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
    if (isLoadingSchedule && isLoadingPlan) {
      return;
    }
    const currentWeekDay =
      schedule?.schedule.findIndex(
        (el) => el.date === new Date().getDate().toString(),
      ) || 0;

    // якого біса треба о це. гарне питання.
    carouselApi.reInit();

    carouselApi.scrollTo(currentWeekDay);
  }, [carouselApi, isLoadingSchedule, isLoadingPlan]);

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
    if (individualPlan) {
      localStorage.setItem(
        ENABLED_SUBJECTS_KEY,
        JSON.stringify(individualPlan),
      );
      setEnabledSubjects(individualPlan);
    }
  }, [individualPlan]);

  useEffect(() => {
    if (enabledSubjects.length) {
      localStorage.setItem(
        ENABLED_SUBJECTS_KEY,
        JSON.stringify(enabledSubjects),
      );
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
          {schedule?.uniqueList?.map(({ subjectName, isSelectable }) => (
            <label
              key={subjectName}
              className="flex flex-col  my-1 px-2 pb-3 pt-1 border rounded-lg"
            >
              {isSelectable ? (
                <div className="w-full text-slate-400">Вибірковий предмет</div>
              ) : null}
              <div className="flex  gap-x-3 w-full items-center">
                <Checkbox
                  checked={Boolean(
                    enabledSubjects?.find((el) => el === subjectName),
                  )}
                  onCheckedChange={(state) => toggleSubject(state, subjectName)}
                />
                <span>{subjectName}</span>
              </div>
            </label>
          ))}
        </SheetContent>
      </Sheet>

      <Carousel className="relative" setApi={setCarouselApi}>
        <CarouselContent className="mt-8">
          {isLoadingSchedule || isLoadingPlan ? (
            <CarouselItem className="flex flex-col">
              <span></span>
              <div className="flex w-full h-64 items-center justify-center">
                <div className="border-2 border-blue-600 p-4 rounded-full border-b-transparent animate-spin"></div>
              </div>
            </CarouselItem>
          ) : null}

          {!isLoadingSchedule && !isLoadingPlan && !enabledSubjects.length ? (
            <CarouselItem className="flex flex-col">
              <span></span>
              <div className="flex w-full h-36 items-center justify-center">
                Потрібно обрати предмети які показувати в розкладі
              </div>
            </CarouselItem>
          ) : null}

          {!isLoadingSchedule &&
            !isLoadingPlan &&
            schedule?.schedule.map(({ weekDay, date, month, type, list }) => {
              const scheduleForDay = list.filter((subj) =>
                isEnabled(subj.name),
              );

              if (!scheduleForDay.length) {
                return (
                  <CarouselItem
                    className="flex flex-col h-72"
                    key={date + month}
                  >
                    <span>
                      {weekDay} {date} {month} {type}
                    </span>
                    <div className="flex w-full h-full items-center justify-center">
                      Вільний день :)
                    </div>
                  </CarouselItem>
                );
              }
              return (
                <CarouselItem className="flex flex-col" key={date + month}>
                  <span>
                    {weekDay} {date} {month} {type}
                  </span>
                  {scheduleForDay?.map((row, i) => (
                    <div
                      key={date + month + i}
                      className="rounded-lg box-border border pb-3 pt-1 px-2 my-1"
                    >
                      <span className="text-slate-500">{row.number}</span>
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
