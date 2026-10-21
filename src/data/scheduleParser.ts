import { HTMLElement, TextNode, parse } from "node-html-parser";
import { WeekType } from "@/types/schedule";

export type { WeekType };

export type ScheduleLesson = {
  /** Повна назва заняття, разом з типом у дужках. */
  name: string;
  /** Назва предмету без типу заняття. */
  subjectName: string;
  /** Тип заняття у оригінальному вигляді: "лекція", "практика", ... */
  studyType: string;
  /** Скорочений тип заняття, як у публічному API ІСУ: "лекц.", "пр.", "лаб.". */
  type: string;
  /** Аудиторія. */
  auditory: string;
  /** Викладач. */
  teacher: string;
};

export type SchedulePair = {
  /** Номер пари. */
  number: number;
  /** Час пари у вигляді "8:00-9:20". */
  time: string;
  /** Початок пари, "8:00". */
  start: string;
  /** Кінець пари, "9:20". */
  end: string;
  /** Заняття в цій парі (пара може мати декілька груп). */
  lessons: ScheduleLesson[];
};

export type ScheduleReplacement = {
  /** Підпис, зазвичай "За розкладом:". */
  label: string;
  /** Опис заміни, наприклад "четверга, знаменник". */
  description: string;
  /** День, розклад якого взято, "Четвер". */
  day: string | null;
  /** Тижня, за яким відбувається заміна, якщо вдалося визначити. */
  weekType: WeekType | null;
};

export type ScheduleDay = {
  /** Повна назва дня, "Понеділок". */
  name: string;
  /** Скорочена назва дня, "Пн". */
  shortName: string;
  /** Дата у вигляді "19.10.26". */
  date: string;
  /** Чи є цей день сьогоднішнім. */
  isToday: boolean;
  /** Чи цей день є заміненим. */
  isReplacement: boolean;
  /** Деталі заміни, якщо день замінений. */
  replacement: ScheduleReplacement | null;
  /** Пари цього дня. */
  pairs: SchedulePair[];
};

export type ScheduleSubstitution = {
  /** Дата заміни у вигляді "04.09.2026". */
  date: string;
  /** Опис заміни, "понеділка, чисельник". */
  description: string;
  /** День, розклад якого взято, "Понеділок". */
  day: string | null;
  /** Тижня, за яким відбувається заміна, якщо вдалося визначити. */
  weekType: WeekType | null;
};

export type SchedulePage = {
  /** Прізвище та ініціали студента. */
  student: string;
  /** Дата, за яку відкрито розклад, "21.10.2026". */
  date: string;
  /** Дата попереднього тижня ("14.10.2026"), якщо є навігація по тижнях. */
  previousWeekDate: string | null;
  /** Дата наступного тижня ("28.10.2026"), якщо є навігація по тижнях. */
  nextWeekDate: string | null;
  /** Тижня розкладу. */
  weekType: WeekType;
  /** Назва тижня розкладу, "Знаменник" / "Чисельник". */
  weekTypeName: string;
  /** Дні розкладу. */
  days: ScheduleDay[];
  /** Заміни пʼятниці за весь семестр. */
  substitutions: ScheduleSubstitution[];
};

const STUDY_TYPES: Record<string, string> = {
  лекція: "лекц.",
  практика: "пр.",
  "практичне заняття": "пр.",
  лабораторна: "лаб.",
  "лабораторне заняття": "лаб.",
  семінарська: "сем.",
  "семінарське заняття": "сем.",
};

const WEEK_TYPE_BY_COLOR: Record<string, WeekType> = {
  "#007b22": "up",
  "#0026e6": "bottom",
};

const SHORT_DAY_NAMES: Record<string, string> = {
  понеділок: "Пн",
  вівторок: "Вт",
  середа: "Ср",
  четвер: "Чт",
  пʼятниця: "Пт",
  "п'ятниця": "Пт",
  "п’ятниця": "Пт",
  субота: "Сб",
  неділя: "Нд",
};

/**
 * Назви днів у родовому відмінку (як у описі заміни) -> назив у називному,
 * щоб можна було знайти відповідний стовпчик таблиці.
 */
const GENITIVE_DAY_NAMES: Record<string, string> = {
  понеділка: "Понеділок",
  вівторка: "Вівторок",
  середи: "Середа",
  четверга: "Четвер",
  "п'ятниці": "П'ятниця",
  пʼятниці: "П'ятниця",
  "п’ятниці": "П'ятниця",
  суботи: "Субота",
  неділі: "Неділя",
};

const WEEK_TYPE_NAMES: Record<WeekType, string> = {
  up: "Чисельник",
  bottom: "Знаменник",
};

/**
 * Текст, який лежить одразу у вузлі, без вкладених елементів.
 * Використовується, щоб не тягнути в себе вміст `.date-text` чи `.subst-box`.
 */
function ownText(element: HTMLElement | null): string {
  if (!element) {
    return "";
  }

  return element.childNodes
    .filter((node): node is TextNode => node instanceof TextNode)
    .map((node) => node.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function text(element?: HTMLElement | null): string {
  if (!element) {
    return "";
  }

  return element.textContent.replace(/\s+/g, " ").trim();
}

function colorFromStyle(style: string | undefined | null): string | null {
  if (!style) {
    return null;
  }

  const match = style.match(/color\s*:\s*(#[0-9a-fA-F]{3,8})/);

  return match?.[1]?.toLowerCase() ?? null;
}

function weekTypeByColor(color: string | undefined | null): WeekType | null {
  if (!color) {
    return null;
  }

  return WEEK_TYPE_BY_COLOR[color.trim().toLowerCase()] ?? null;
}

function weekTypeByName(name: string): WeekType {
  return name.toLowerCase().includes("чисельник") ? "up" : "bottom";
}

/**
 * Тижня розкладу сторінки. Спершу перевіряється клас шапки
 * (`week-numerator` / `week-denominator`), а потім сам текст.
 */
function detectPageWeekType(
  header: HTMLElement | null,
  weekTypeName: string,
): WeekType {
  if (header?.classList.contains("week-numerator")) {
    return "up";
  }

  if (header?.classList.contains("week-denominator")) {
    return "bottom";
  }

  return weekTypeByName(weekTypeName);
}

/**
 * Визначає тижня заміни: спершу за кольором (ІСУ підсвічує чисельник зеленим,
 * а знаменник синім), а якщо кольору нема — за текстом опису.
 */
function detectWeekType(
  description: string,
  style?: string | null,
): WeekType | null {
  const byColor = weekTypeByColor(colorFromStyle(style));

  if (byColor) {
    return byColor;
  }

  const normalized = description.toLowerCase();

  if (normalized.includes("чисельник")) {
    return "up";
  }

  if (normalized.includes("знаменник")) {
    return "bottom";
  }

  return null;
}

function shortDayName(name: string): string {
  return SHORT_DAY_NAMES[name.trim().toLowerCase()] ?? name.trim().slice(0, 2);
}

/**
 * Розбирає опис заміни "четверга, знаменник" на день і тижня.
 */
function parseReplacementDescription(description: string): {
  day: string | null;
  weekType: WeekType | null;
} {
  const [dayPart = "", weekPart = ""] = description.split(",");
  const day = GENITIVE_DAY_NAMES[dayPart.trim().toLowerCase()] ?? null;
  const weekType = weekPart.trim().toLowerCase().includes("чисельник")
    ? "up"
    : weekPart.trim().toLowerCase().includes("знаменник")
      ? "bottom"
      : null;

  return { day, weekType };
}

/**
 * Розбирає назву заняття на предмет та тип.
 * "Іноземна мова за професійним спрямуванням (практика)"
 *   -> subjectName: "Іноземна мова за професійним спрямуванням", studyType: "практика"
 */
function splitLessonTitle(title: string): {
  subjectName: string;
  studyType: string;
} {
  const match = title.match(/^(.*?)\s*\(([^()]+)\)\s*$/);

  if (!match) {
    return { subjectName: title, studyType: "" };
  }

  return {
    subjectName: match[1].trim(),
    studyType: match[2].trim(),
  };
}

function parseLesson(box: HTMLElement): ScheduleLesson {
  const title = text(box.querySelector(".lesson-title"));
  const { subjectName, studyType } = splitLessonTitle(title);

  return {
    name: title,
    subjectName,
    studyType,
    type: STUDY_TYPES[studyType.toLowerCase()] ?? studyType,
    auditory: text(box.querySelector(".lesson-aud")),
    teacher: text(box.querySelector(".lesson-teacher")),
  };
}

function parsePairs(table: HTMLElement): SchedulePair[][] {
  const rows = table.querySelectorAll("tbody tr");
  const pairsByDay: SchedulePair[][] = [];

  rows.forEach((row) => {
    const number = parseInt(text(row.querySelector(".pair-num-col")), 10);

    if (!Number.isFinite(number)) {
      return;
    }

    const time = text(row.querySelector(".pair-time-col"));
    const [start = "", end = ""] = time.split("-");

    // Кожна комірка рядка відповідає своєму дню тижня.
    row.querySelectorAll("td.cell-lesson").forEach((cell, dayIndex) => {
      if (!pairsByDay[dayIndex]) {
        pairsByDay[dayIndex] = [];
      }

      pairsByDay[dayIndex].push({
        number,
        time,
        start: start.trim(),
        end: end.trim(),
        lessons: cell.querySelectorAll(".lesson-box").map(parseLesson),
      });
    });
  });

  return pairsByDay;
}

function parseDayHeaders(table: HTMLElement): ScheduleDay[] {
  const headers = table
    .querySelectorAll("thead th.col-header")
    .filter((header) => header.querySelector(".date-text"));

  const pairsByDay = parsePairs(table);

  return headers.map((header, index) => {
    const name = ownText(header);
    const substBox = header.querySelector(".subst-box");
    const substDesc = substBox?.querySelector(".subst-desc");
    const description = text(substDesc);
    const parsedDescription = parseReplacementDescription(description);

    return {
      name,
      shortName: shortDayName(name),
      date: text(header.querySelector(".date-text")),
      isToday: header.classList.contains("is-today"),
      isReplacement: header.classList.contains("is-replacement"),
      replacement: substBox
        ? {
            label: text(substBox.querySelector(".subst-label")),
            description,
            day: parsedDescription.day,
            weekType:
              parsedDescription.weekType ??
              detectWeekType(description, substDesc?.getAttribute("style")),
          }
        : null,
      pairs: pairsByDay[index] ?? [],
    };
  });
}

function parseSubstitutions(root: HTMLElement): ScheduleSubstitution[] {
  const table = root.querySelector(".evac-subst-table");
  if (!table) {
    return [];
  }

  return table
    .querySelectorAll("tbody tr")
    .map((row) => {
      const descriptionCell = row.querySelector(".evac-desc-col");
      const descSpan = descriptionCell?.querySelector("span");
      const description = text(descriptionCell);
      const parsedDescription = parseReplacementDescription(description);

      return {
        date: text(row.querySelector(".evac-date-col")),
        description,
        day: parsedDescription.day,
        weekType:
          parsedDescription.weekType ??
          detectWeekType(description, descSpan?.getAttribute("style")),
      };
    })
    .filter((substitution) => Boolean(substitution.date));
}

/**
 * Дати сусідніх тижнів із кнопок навігації (`setDate('28.10.2026')`).
 */
function parseWeekNavDates(root: HTMLElement): {
  previous: string | null;
  next: string | null;
} {
  const dates: string[] = [];

  root.querySelectorAll(".week-nav-btn").forEach((button) => {
    const match = button.getAttribute("onclick")?.match(/setDate\('([^']+)'\)/);

    if (match?.[1]) {
      dates.push(match[1]);
    }
  });

  return {
    previous: dates[0] ?? null,
    next: dates[1] ?? null,
  };
}

/**
 * Парсить сторінку розкладу студента
 * (https://isu1.khmnu.edu.ua/isu/dbsupport/students/studentSchedule.php)
 * у зручний для додатка JSON.
 *
 * Очікує на вже декодований HTML (сторінка віддається у windows-1251).
 */
export function parseSchedulePage(html: string): SchedulePage {
  const root = parse(html);
  const table = root.querySelector(".week-table");

  if (!table) {
    throw new Error("Не знайдено таблицю розкладу на сторінці");
  }

  const weekTypeHeader = root.querySelector(".week-type-header");
  const weekTypeName = text(weekTypeHeader) || WEEK_TYPE_NAMES.bottom;
  const { previous, next } = parseWeekNavDates(root);

  return {
    student: text(root.querySelector(".student-header")),
    date:
      root.querySelector('input[name="date"]')?.getAttribute("value")?.trim() ??
      "",
    previousWeekDate: previous,
    nextWeekDate: next,
    weekType: detectPageWeekType(weekTypeHeader, weekTypeName),
    weekTypeName,
    days: parseDayHeaders(table),
    substitutions: parseSubstitutions(root),
  };
}

export default parseSchedulePage;
