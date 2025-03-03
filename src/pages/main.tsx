import { CalendarDaysIcon, TableCellsIcon } from "@heroicons/react/24/outline";

import { useState } from "react";
import HeaderWithBurger from "@/components/header-with-burger";
import BottomNavigation from "@/components/bottom-navigation";
import ScheduleCarousel from "@/components/schedule-carousel";
import JournalsList from "@/components/journals-list";
import ProtectedRoute from "@/components/protected-route";

import { useAppStore } from "@/stores/useAppStore";
import { useProfile } from "@/hooks/useProfile";
import { useSchedule } from "@/hooks/useSchedule";
import { useIndividualPlan } from "@/hooks/useIndividualPlan";

import { useSession } from "@/hooks/useSession";

export default function MainPage() {
  const [page, setPage] = useState<"schedule" | "journals">("schedule");
  const { subjects, session } = useAppStore();
  const {
    data: schedule,
    isLoading: isLoadingSchedule,
    isValidating: isValidatingSchedule,
  } = useSchedule();

  const {
    data: individualPlan,
    mutate,
    isLoading: isLoadingIndividualPlan,
  } = useIndividualPlan();
  const { data: profile } = useProfile();

  const _ = useSession();
  console.log(isLoadingSchedule);

  return (
    <>
      <ProtectedRoute />
      <HeaderWithBurger />
      {isLoadingSchedule ? (
        <div className="absolute w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-10 opacity-0 fade-in-with-delay">
          <video
            autoPlay
            muted
            src="/balamute.mp4"
            className="h-3/6  z-10 rounded-xl  "
          ></video>
          <span className="absolute z-10 w-32 text-center text-lg">
            Відбувається завантаження
          </span>
        </div>
      ) : null}
      <main className="px-4 pt-20 h-full overflow-hidden flex flex-col">
        <div className="fixed top-2">
          <button
            onClick={() =>
              useAppStore.setState({ user: undefined, session: undefined })
            }
            className="border-2 px-4 py-2 m-2"
          >
            reset
          </button>
        </div>
        <h1 className="font-semibold text-3xl text-slate-950 dark:text-white">
          Привіт, {profile?.name}!
        </h1>
        <div className="flex pt-2.5 gap-1.5">
          <button
            onMouseDown={() => setPage("schedule")}
            className={`flex px-7 py-3 ${page === "schedule" ? "bg-blue-900 dark:bg-blue-600 text-white" : "text-blue-900 bg-blue-50"} rounded-2xl  gap-1.5`}
          >
            <CalendarDaysIcon width={24} /> Розклад
          </button>
          <button
            onMouseDown={() => setPage("journals")}
            className={`flex px-7 py-3 ${page === "journals" ? "bg-blue-900 dark:bg-blue-600 text-white" : "text-blue-900 bg-blue-50"} rounded-2xl  gap-1.5`}
          >
            <TableCellsIcon width={24} /> Журнал
          </button>
        </div>
        {page === "schedule" ? (
          <ScheduleCarousel
            schedule={schedule || []}
            // isLoadingSchedule={isLoadingSchedule || isValidatingSchedule}
            isLoadingSchedule={true}
            individualPlan={individualPlan}
            isLoadingIndividualPlan={isLoadingIndividualPlan}
          />
        ) : null}
        {page === "journals" ? (
          <div>meow meow</div>
        ) : // <JournalsList journals={subjects || []} />
        null}
      </main>
      <BottomNavigation />
    </>
  );
}
