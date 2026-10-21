import { API_URL } from "@/config";
import { SchedulePage, parseSchedulePage } from "@/data/scheduleParser";

export const SCHEDULE_URL =
  "https://isu1.khmnu.edu.ua/isu/dbsupport/students/studentSchedule.php";

const decoder = new TextDecoder("windows-1251");

type FetchOptions = {
  /** Токен сесії (PHPSESSID). */
  token: string;
  /** Дата тижня у вигляді "21.10.2026". Якщо не задана — береться поточний тиждень. */
  date?: string;
};

/**
 * Посилання на сторінку розкладу для конкретного тижня.
 *
 * Дату передаємо query-параметром, а не POST-тілом: проксі не пересилає
 * тіло запиту, тому тиждень через POST просто не змінювався.
 */
function scheduleUrl(date?: string) {
  return date
    ? `${SCHEDULE_URL}?date=${encodeURIComponent(date)}`
    : SCHEDULE_URL;
}

/**
 * Завантажує HTML сторінки розкладу студента через проксі.
 *
 * Проксі вже декодує сторінку з windows-1251 у UTF-8, тому тут береться
 * звичайний текст.
 */
export async function fetchSchedulePage({
  token,
  date,
}: FetchOptions): Promise<string> {
  const response = await fetch(
    `${API_URL}/api/proxy?url=${encodeURIComponent(scheduleUrl(date))}`,
    {
      method: "GET",
      headers: {
        Authorization: token,
      },
    },
  );

  return response.text();
}

/**
 * Завантажує HTML сторінки розкладу студента напряму з ІСУ.
 *
 * Сторінка віддається у windows-1251, тому байти декодуються вручну.
 * Потрібна сесія у браузері на isu1.khmnu.edu.ua (cookies) або запит
 * з переданою Cookie.
 */
export async function fetchSchedulePageDirect({
  date,
  cookie,
}: {
  date?: string;
  cookie?: string;
}): Promise<string> {
  const response = await fetch(scheduleUrl(date), {
    method: "GET",
    credentials: "include",
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
    },
  });

  const buffer = await response.arrayBuffer();

  return decoder.decode(buffer);
}

/**
 * Завантажує розклад студента та повертає його у вигляді JSON.
 *
 * @param token токен сесії (PHPSESSID)
 * @param date дата тижня у вигляді "21.10.2026", за замовчуванням — поточний тиждень
 */
export async function getStudentSchedule(
  token: string,
  date?: string,
): Promise<SchedulePage> {
  const html = await fetchSchedulePage({ token, date });

  return parseSchedulePage(html);
}

export default getStudentSchedule;
