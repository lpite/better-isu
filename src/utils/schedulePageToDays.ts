import {
  ScheduleDay,
  SchedulePage,
  ScheduleSubstitution,
} from "@/data/scheduleParser";

export type ScheduleDayItem = {
  number: string;
  name: string;
  subjectName: string;
  auditory: string;
  teacherShortName: string;
  teacherFullName: string;
  dateFrom: string;
  dateTo: string;
};

export type ScheduleDayListItem = {
  date: string;
  month: string;
  weekDay: string;
  type: string;
  /** Опис заміни дня, якщо день замінений. */
  replacement: string | null;
  list: ScheduleDayItem[];
};

const MONTHS = [
  "Січня",
  "Лютого",
  "Березня",
  "Квітня",
  "Травня",
  "Червня",
  "Липня",
  "Серпня",
  "Вересня",
  "Жовтня",
  "Листопада",
  "Грудня",
];

/**
 * "19.10.26" -> { day: "19", month: "Жовтня" }
 */
function splitDate(date: string): { day: string; month: string } {
  const [day = "", month = ""] = date.split(".");

  return {
    day,
    month: MONTHS[parseInt(month, 10) - 1] ?? "",
  };
}

/**
 * "23.10.26" і "23.10.2026" -> "23.10.2026", щоб можна було матчити
 * дату з колонки з датою з таблиці замін.
 */
function normalizeDate(date: string): string {
  const [day = "", month = "", year = ""] = date.trim().split(".");
  const fullYear = year.length === 2 ? `20${year}` : year;

  return `${day}.${month}.${fullYear}`;
}

/**
 * Якщо день замінений (наприклад пʼятниця заміняється на понеділок),
 * беремо розклад дня-заміни з підказки в таблиці замін.
 */
function applyReplacement(day: ScheduleDay, source: ScheduleDay): ScheduleDay {
  const lessonsByNumber = new Map(
    source.pairs.map((pair) => [pair.number, pair.lessons]),
  );

  const pairs = day.pairs.map((pair) => ({
    ...pair,
    lessons: lessonsByNumber.get(pair.number) ?? [],
  }));

  const knownNumbers = new Set(day.pairs.map((pair) => pair.number));

  source.pairs
    .filter((pair) => !knownNumbers.has(pair.number))
    .forEach((pair) => {
      pairs.push({ ...pair, lessons: pair.lessons });
    });

  return { ...day, pairs };
}

/**
 * Пʼятниці (та будь-які інші замінені дні) беруть розклад того дня,
 * який вказано у таблиці замін: "23.10.2026 четверга, знаменник" —
 * тобто розклад четверга знаменника.
 *
 * Підказка в таблиці замін важливіша за підказку в шапці колонки,
 * бо вона є для всіх пʼятниць семестру, а не тільки для поточного тижня.
 */
function resolveReplacements(pages: SchedulePage[]): SchedulePage[] {
  const substitutions = new Map<string, ScheduleSubstitution>();

  pages.forEach((page) =>
    page.substitutions.forEach((substitution) => {
      substitutions.set(normalizeDate(substitution.date), substitution);
    }),
  );

  return pages.map((page) => ({
    ...page,
    days: page.days.map((day) => {
      const hint = substitutions.get(normalizeDate(day.date));
      const source = hint?.day ? hint : day.replacement;

      if (!source?.day) {
        return day;
      }

      // розклад потрібного тижня ("чисельник"/"знаменник") може бути
      // на сусідньому тижні, тому шукаємо серед усіх завантажених
      const sourcePage =
        page.weekType === source.weekType
          ? page
          : pages.find((el) => el.weekType === source.weekType);

      if (!sourcePage) {
        return day;
      }

      const sourceDay = sourcePage.days.find((el) => el.name === source.day);

      if (!sourceDay) {
        return day;
      }

      return {
        ...applyReplacement(day, sourceDay),
        replacement: hint
          ? {
              label: day.replacement?.label ?? "За розкладом:",
              description: hint.description,
              day: hint.day,
              weekType: hint.weekType,
            }
          : day.replacement,
      };
    }),
  }));
}

/**
 * Переводить розклад зі сторінки ІСУ у формат, який очікує `ScheduleCarousel`
 * ({ date, month, weekDay, type, list }).
 *
 * Приймає розклад за кілька тижнів (сторінка ІСУ показує тільки один тиждень),
 * тому тижні просто йдуть один за одним.
 */
export default function schedulePagesToDays(
  pages: SchedulePage[],
): ScheduleDayListItem[] {
  return resolveReplacements(pages).flatMap((page) =>
    page.days.map((day) => {
      const { day: date, month } = splitDate(day.date);

      return {
        date,
        month,
        weekDay: day.shortName,
        type: page.weekTypeName,
        replacement: day.replacement?.description ?? null,
        list: day.pairs.flatMap((pair) =>
          pair.lessons.map((lesson) => ({
            number: `# ${pair.number} ${pair.start} - ${pair.end}`,
            name: lesson.name,
            subjectName: lesson.subjectName,
            auditory: lesson.auditory,
            teacherShortName: lesson.teacher,
            teacherFullName: lesson.teacher,
            dateFrom: "",
            dateTo: "",
          })),
        ),
      };
    }),
  );
}
