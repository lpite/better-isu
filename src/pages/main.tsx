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
import { useSubjects } from "@/hooks/useSubjects";

export default function MainPage() {
  const [page, setPage] = useState<"schedule" | "journals">("schedule");
  const { session } = useAppStore();
  const { data: schedule, isLoading: isLoadingSchedule } = useSchedule();
  const {
    data: individualPlan,
    mutate,
    isLoading: isLoadingIndividualPlan,
  } = useIndividualPlan();
  const { data: profile } = useProfile();
  // const { data: subjects } = useSubjects();

  return (
    <>
      <ProtectedRoute />
      <HeaderWithBurger />
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
            isLoadingSchedule={isLoadingSchedule}
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
