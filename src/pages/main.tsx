import { useState } from "react";
import HeaderWithBurger from "@/components/header-with-burger";
import BottomNavigation from "@/components/bottom-navigation";
import ScheduleCarousel from "@/components/schedule-carousel";
import JournalsList from "@/components/journals-list";
import ProtectedRoute from "@/components/protected-route";

import { useProfile } from "@/hooks/useProfile";
import { useSchedule } from "@/hooks/useSchedule";
import { useStudentSchedule } from "@/hooks/useStudentSchedule";
import { useIndividualPlan } from "@/hooks/useIndividualPlan";

import { useSession } from "@/hooks/useSession";
import { useSubjects } from "@/hooks/useSubjects";
import { CalendarDays, NotebookText } from "lucide-react";
import { ScheduleDay } from "@/components/schedule-carousel";

export default function MainPage() {
  const [page, setPage] = useState<"schedule" | "journals">("schedule");
  const { status: sessionStatus } = useSession();

  // Розклад з реальної сторінки ІСУ (з замінами та точним часом пар).
  const {
    data: studentSchedule,
    error: studentScheduleError,
    isLoading: isLoadingStudentSchedule,
    isValidating: isValidatingStudentSchedule,
  } = useStudentSchedule();

  // Розклад групи з публічного API ІСУ — резервний варіант,
  // якщо сторінка студента недоступна.
  const {
    data: groupSchedule,
    isLoading: isLoadingGroupSchedule,
    isValidating: isValidatingGroupSchedule,
  } = useSchedule({ enabled: Boolean(studentScheduleError) });

  const schedule: ScheduleDay[] = studentSchedule ?? groupSchedule ?? [];
  const isLoadingSchedule =
    sessionStatus === "loading" ||
    isLoadingStudentSchedule ||
    (Boolean(studentScheduleError) && isLoadingGroupSchedule);
  const isValidatingSchedule =
    isValidatingStudentSchedule || isValidatingGroupSchedule;

  const { data: individualPlan, isLoading: isLoadingIndividualPlan } =
    useIndividualPlan();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  const {
    data: subjects,
    isLoading: isLoadingSubjects,
    error: subjectsError,
  } = useSubjects();
  return (
    <>
      <ProtectedRoute />
      <HeaderWithBurger />
      <main className="px-4 pt-20 h-full overflow-hidden flex flex-col">
        <h1 className="font-semibold text-3xl text-foreground flex items-center">
          Привіт, {profile?.name}
          {isLoadingProfile ? (
            <div className="h-8 w-8 mx-2 border border-blue-700 border-t-transparent animate-spin rounded-full inline-block"></div>
          ) : (
            "!"
          )}
        </h1>
        <div className="flex pt-2.5 gap-1.5">
          <button
            onMouseDown={() => setPage("schedule")}
            className={`flex items-center flex-1 px-3 py-3 ${page === "schedule" ? "bg-primary text-white" : "text-foreground bg-muted"} rounded-2xl gap-1.5 duration-300`}
          >
            <CalendarDays height={20} width={20} /> Розклад
          </button>
          <button
            onMouseDown={() => setPage("journals")}
            className={`flex items-center flex-1 px-3 py-3 ${page === "journals" ? "bg-primary text-white" : "text-foreground bg-muted"} rounded-2xl gap-1.5 duration-300`}
          >
            <NotebookText height={20} width={20} /> Журнали
          </button>
        </div>
        {page === "schedule" ? (
          <ScheduleCarousel
            schedule={schedule}
            isLoadingSchedule={isLoadingSchedule}
            isValidatingSchedule={isValidatingSchedule}
            individualPlan={individualPlan}
            isLoadingIndividualPlan={isLoadingIndividualPlan}
          />
        ) : null}
        {page === "journals" ? (
          <JournalsList
            journals={subjects || []}
            isLoading={isLoadingSubjects}
            error={subjectsError}
          />
        ) : null}
      </main>
      <BottomNavigation />
    </>
  );
}
