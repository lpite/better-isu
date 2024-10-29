import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { GetUserSchedule200 } from "../../orval/model";
import { GetUserIndividualPlanQueryResult } from "../../orval/default/default";

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
    console.log(localStorage.getItem("ENABLED_SUBJECTS_KEY"));
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

  return (
    <Carousel setApi={setApi} className="overflow-auto mb-14">
      <CarouselContent>
        {schedule?.map(({ date, month, type, list, weekDay }) => (
          <CarouselItem key={date + month + weekDay}>
            <div className="flex items-center justify-between pt-3.5 pb-2.5 text-blue-900 dark:text-blue-300">
              <span>
                {date} {month} {weekDay} ({type})
              </span>
              <div className="flex gap-5 ">
                <button onMouseDown={() => api?.scrollPrev()}>
                  <ArrowLongLeftIcon width={24} />
                </button>
                <button onMouseDown={() => api?.scrollNext()}>
                  <ArrowLongRightIcon width={24} />
                </button>
              </div>
            </div>
            {list
              ?.filter(({ name }) => isEnabled(name))
              .map(({ name, auditory, number, teacherShortName }) => (
                <div
                  key={date + number + name}
                  className="border border-solid border-slate-300 dark:border-slate-600 p-2 rounded-lg mb-1.5"
                >
                  <div className="flex justify-between text-slate-300">
                    <span>{number}</span>
                    <span>{auditory}</span>
                  </div>
                  <div className="text-slate-950 dark:text-white">{name}</div>
                  <div>{teacherShortName}</div>
                </div>
              ))}
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
