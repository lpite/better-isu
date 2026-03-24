import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import { useEffect, useState } from "react";
import {
  GetUserSchedule200,
  GetUserSchedule200ScheduleItemListItem,
} from "../../orval/model";
import { GetUserIndividualPlanQueryResult } from "../../orval/default/default";
import { ArrowLeft, ArrowRight } from "lucide-react";

type ScheduleCarouselProps = {
  isLoadingSchedule: boolean;
  schedule?: GetUserSchedule200["schedule"];
  individualPlan?: GetUserIndividualPlanQueryResult;
  isLoadingIndividualPlan: boolean;
};

export default function ScheduleCarousel({
  schedule,
  individualPlan,
  isLoadingSchedule,
}: ScheduleCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [enabledSubjects, setEnabledSubjects] = useState<string[]>([]);
  useEffect(() => {
    if (!api) {
      return;
    }
    if (!api) {
      return;
    }
    // if (isLoadingSchedule && isLoadingPlan) {
    //   return;
    // }
    const currentWeekDay =
      schedule?.findIndex(
        (el) => el.date === new Date().getDate().toString(),
      ) || 0;

    // якого біса треба о це. гарне питання.
    api.reInit();

    api.scrollTo(currentWeekDay, true);
  }, [api, isLoadingSchedule]);

  function isEnabled(subjName: string) {
    if (!enabledSubjects.length) {
      return true;
    }

    if (enabledSubjects.findIndex((el) => subjName.includes(el)) !== -1) {
      return true;
    }

    return false;
  }

  useEffect(() => {
    const saved = (JSON.parse(
      localStorage.getItem("ENABLED_SUBJECTS_KEY") || "[]",
    ) || []) as string[];

    if (saved.length) {
      setEnabledSubjects(saved);
    }
  }, []);

  useEffect(() => {
    if (individualPlan?.length) {
      setEnabledSubjects(individualPlan);
      localStorage.setItem(
        "ENABLED_SUBJECTS_KEY",
        JSON.stringify(individualPlan),
      );
    }
  }, [individualPlan]);

  if (isLoadingSchedule) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="h-8 w-8 mx-2 border border-blue-700 border-t-transparent animate-spin rounded-full inline-block"></div>
      </div>
    );
  }

  return (
    <Carousel
      setApi={setApi}
      className="flex-1 min-h-0 mb-14 select-none opacity-0 fade-in-with-delay"
    >
      <CarouselContent className="h-full">
        {schedule &&
          schedule?.map(({ date, month, type, list, weekDay }) => (
            <CarouselItem
              className="h-full flex  pt-12 relative"
              key={date + month + weekDay}
            >
              <div className="absolute top-0 start-6 end-0 flex items-center justify-between pt-3.5 pb-2.5 text-foreground">
                <span>
                  {date} {month} {weekDay} ({type})
                </span>
                <div className="flex gap-5 ">
                  <button onMouseDown={() => api?.scrollPrev()}>
                    <ArrowLeft height={18} width={18} />
                  </button>
                  <button onMouseDown={() => api?.scrollNext()}>
                    <ArrowRight height={18} width={18} />
                  </button>
                </div>
              </div>
              <div className="min-h-0 overflow-y-auto w-full">
                {list
                  ?.filter(({ name }) => isEnabled(name))
                  .map((item) => (
                    <ScheduleItem
                      key={date + item.number + item.name + item.auditory}
                      {...item}
                      date={date}
                    />
                  ))}
                {!list?.filter(({ name }) => isEnabled(name)).length ? (
                  <div className="h-full flex items-center justify-center text-xl">
                    Вихідний :)
                  </div>
                ) : null}
              </div>
            </CarouselItem>
          ))}
      </CarouselContent>
    </Carousel>
  );
}

function ScheduleItem({
  name,
  auditory,
  number,
  teacherShortName,
  teacherFullName,
  date,
}: GetUserSchedule200ScheduleItemListItem & { date: string }) {
  const [showFullName, setShowFullName] = useState(false);

  return (
    <div
      key={date + number + name}
      className="border border-solid border-slate-300 dark:border-slate-600 p-2 rounded-lg mb-1.5"
    >
      <div className="flex justify-between text-slate-500 dark:text-slate-300">
        <span>{number}</span>
        <span>{auditory}</span>
      </div>
      <div className="text-slate-950 dark:text-white">{name}</div>
      <div onClick={() => setShowFullName(!showFullName)}>
        {showFullName ? teacherFullName : teacherShortName}
      </div>
    </div>
  );
}
