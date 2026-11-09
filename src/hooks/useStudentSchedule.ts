import useSWR, { useSWRConfig } from "swr";
import { getStudentSchedule } from "@/data/getStudentSchedule";
import schedulePagesToDays from "@/utils/schedulePageToDays";
import { useAppStore } from "@/stores/useAppStore";
import { ScheduleDay } from "@/types/schedule";
import { useSession } from "./useSession";

export function formatIsuDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${day}.${month}.${date.getFullYear()}`;
}

function addDays(date: Date, days: number) {
  const result = new Date(date.getTime());

  result.setDate(result.getDate() + days);

  return result;
}

/**
 * Розклад студента з реальної сторінки ІСУ.
 *
 * Сторінка показує тільки один тиждень, тому вантажиться поточний і наступний
 * тиждень (дату наступного беремо з навігації на сторінці).
 */
export function useStudentSchedule() {
  const { status, session } = useSession();
  const user = useAppStore((state) => state.user);
  const { cache } = useSWRConfig();
  const token = session?.token;
  const canFetch = status === "authorised" && Boolean(token);
  const scheduleKey = user?.login ? `studentSchedule-${user.login}` : null;
  const cachedSchedule = scheduleKey
    ? (cache.get(scheduleKey)?.data as ScheduleDay[] | undefined)
    : undefined;

  return useSWR(
    // Ключ прив'язаний до користувача, а не сесії, щоб локальна копія
    // розкладу була доступною і після оновлення токена.
    canFetch ? scheduleKey : null,
    async () => {
      const current = await getStudentSchedule(token as string);
      const nextWeekDate =
        current.nextWeekDate ?? formatIsuDate(addDays(new Date(), 7));

      try {
        const next = await getStudentSchedule(token as string, nextWeekDate);

        return schedulePagesToDays([current, next]);
      } catch (err) {
        // наприкінці семестру наступного тижня вже може не бути
        console.error("cant load next week schedule", err);

        return schedulePagesToDays([current]);
      }
    },
    {
      // Показуємо локальну копію навіть під час відновлення сесії.
      // Після успішного запиту SWR замінить її актуальними даними.
      fallbackData: cachedSchedule,
      revalidateOnMount: true,
      onError: (err) => {
        console.error(err);
      },
    },
  );
}
