import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z as zod } from "@hono/zod-openapi";
import { Session } from "../types/session";
import { sessionMiddleware } from "../middlewares/sessionMiddleware";
import { sql } from "kysely";
import { db } from "../utils/db";
import { refreshSubjectsList } from "../utils/getSession";
import getRatingPage from "../utils/getRatingPage";
import { getJoeBidenInfo } from "../utils/getJoeBidenInfo";
import { refreshSchedule } from "../utils/refreshSchedule";
import { cacheClient } from "../utils/memcached";
import { cyrb53 } from "../utils/hash";
import getIndividualPlan from "../utils/getIndividualPlan";
import { getGroup } from "../utils/getGroups";
import { getGeneralGetTypeOfWeek } from "../../orval/default/default";

export const userRouter = new OpenAPIHono<{
  Variables: { session: Session };
}>();

userRouter.use(sessionMiddleware);

const profile = createRoute({
  method: "get",
  path: "/profile",
  responses: {
    200: {
      description: "user profile info",
      content: {
        "application/json": {
          schema: zod.object({
            name: zod.string(),
            surname: zod.string(),
            recordNumber: zod.string(),
            birthDate: zod.string(),
            group: zod.string(),
            course: zod.string(),
            faculty: zod.string(),
            speciality: zod.string(),
          }),
        },
      },
    },
  },
});

userRouter.openapi(profile, async (c) => {
  const session = c.get("session");

  if (session.session_id === "joe_biden_session") {
    return c.json(getJoeBidenInfo().profile);
  }

  const userProfile = await db
    .selectFrom("user")
    .select([
      "name",
      "surname",
      "record_number as recordNumber",
      "birth_date as birthDate",
      "group",
      "faculty",
      "course",
      "speciality",
    ])
    .where("user.id", "=", session.user_id)
    .executeTakeFirstOrThrow();
  return c.json(userProfile);
});

const subjects = createRoute({
  path: "/subjects",
  method: "get",
  responses: {
    200: {
      description: "subjects for user",
      content: {
        "application/json": {
          schema: zod.array(
            zod.object({
              link: zod.string(),
              name: zod.string(),
            }),
          ),
        },
      },
    },
  },
});

userRouter.openapi(subjects, async (c) => {
  const session = c.get("session");

  if (session.session_id === "joe_biden_session") {
    return c.json(getJoeBidenInfo().subjects);
  }
  const subjects = await db
    .selectFrom("subjects_list")
    .select([sql<{ name: string; link: string }[] | string>`data`.as("data")])
    .where("session_id", "=", session.id)
    .executeTakeFirst();

  if (!subjects || !subjects?.data?.length) {
    const subjects = await refreshSubjectsList(session);
    if (!subjects) {
      return c.json([]);
    }
    return c.json(subjects);
  }

  if (typeof subjects.data === "string") {
    return c.json(JSON.parse(subjects.data.toString()));
  }

  return c.json(subjects.data);
});

const schedule = createRoute({
  path: "/schedule",
  method: "get",
  responses: {
    200: {
      description: "schedule for user",
      content: {
        "application/json": {
          schema: zod.object({
            uniqueList: zod.array(
              zod.object({
                subjectName: zod.string(),
                isSelectable: zod.boolean(),
              }),
            ),
            schedule: zod.array(
              zod.object({
                type: zod.string(),
                date: zod.string(),
                month: zod.string(),
                weekDay: zod.string(),
                list: zod.array(
                  zod.object({
                    name: zod.string(),
                    number: zod.string(),
                    dateFrom: zod.string(),
                    dateTo: zod.string(),
                    auditory: zod.string(),
                    subjectName: zod.string(),
                    teacherShortName: zod.string(),
                    teacherFullName: zod.string(),
                  }),
                ),
              }),
            ),
          }),
        },
      },
    },
  },
});
const correctWeekDays = [6, 0, 1, 2, 3, 4, 5];
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
function generateDaysList(
  weekType: "up" | "bottom",
  schedule: Record<string, string>[],
) {
  if (!weekType) {
    return [];
  }
  const listOfDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
  const listOfMonth = [
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

  // Список замін для пʼятниці
  const listForFriday = [
    { date: "06.09", type: "up", day: "Пн" },
    { date: "13.09", type: "up", day: "Вт" },
    { date: "20.09", type: "up", day: "Ср" },
    { date: "27.09", type: "up", day: "Чт" },
    { date: "04.10", type: "bottom", day: "Пн" },
    { date: "11.10", type: "bottom", day: "Вт" },
    { date: "18.10", type: "bottom", day: "Ср" },
    { date: "25.10", type: "bottom", day: "Чт" },
    { date: "01.11", type: "up", day: "Пн" },
    { date: "08.11", type: "up", day: "Вт" },
    { date: "15.11", type: "up", day: "Ср" },
    { date: "22.11", type: "up", day: "Чт" },
  ];

  const date = new Date();
  const currentWeekDay = correctWeekDays[date.getDay()];
  // ЯКИЙ ЦЕ ЖАХ.
  const list: {
    date: string;
    weekDay: string;
    month: string;
    type: "Чисельник" | "Знаменник";
    list: any[];
  }[] = [];
  let wt = weekType;

  for (let i = -currentWeekDay; i < 14 - currentWeekDay; i++) {
    const currentDate = new Date(date.getTime() + i * 24 * 60 * 60 * 1000);

    if (currentDate.getDay() === 1 && i !== -currentWeekDay) {
      // wt = weekType;
      if (wt === "up") {
        wt = "bottom";
      } else {
        wt = "up";
      }
    }
    const types = { up: "Чисельник", bottom: "Знаменник" } as const;

    list.push({
      date: `${currentDate.getDate()}`,
      month: `${listOfMonth[currentDate.getMonth()]}`,
      weekDay: listOfDays[correctWeekDays[currentDate.getDay()]],
      type: types[wt],
      list: schedule
        .filter((el) => {
          if (currentDate.getDay() === 5) {
            // заміна пʼятниці
            const scheduleForFriday = listForFriday.find((el) => {
              const [d, m] = el.date.split(".");
              if (
                currentDate.getMonth() + 1 === parseInt(m) &&
                currentDate.getDate() === parseInt(d)
              ) {
                return true;
              }
              return false;
            });
            if (
              el.day === scheduleForFriday?.day &&
              (el.type === scheduleForFriday?.type || el.type === "full")
            ) {
              return true;
            }
            return false;
          }

          if (
            el.day === listOfDays[correctWeekDays[currentDate.getDay()]] &&
            (el.type === wt || el.type === "full")
          ) {
            return true;
          }
          return false;
        })
        .map((el) => {
          return {
            number: `# ${el.number} ${scheduleTimes[el.number]}`,
            name: el.name,
            auditory: el.auditory,
            teacherShortName: el.teacherShortName,
          };
        }),
    });
  }

  return list;
}

function generateUniqueList(schedule: Record<string, any>[]) {
  if (!schedule) {
    return [];
  }
  const arr: { subjectName: string; isSelectable: boolean }[] = [];
  schedule?.forEach(({ subjectName, isSelectable }) => {
    if (!arr.find((el) => el.subjectName === subjectName)) {
      arr.push({ subjectName: subjectName.trim(), isSelectable });
    }
  });
  return arr;
}

userRouter.openapi(schedule, async (c) => {
  const session = c.get("session");

  if (session.session_id === "joe_biden_session") {
    return c.json({
      schedule: [],
      uniqueList: [],
    });
  }

  const user = await db
    .selectFrom("user")
    .select("group")
    .where("id", "=", session.user_id)
    .executeTakeFirstOrThrow();

  let schedule = await db
    .selectFrom("schedule")
    .select(["data"])
    .where("group", "=", user.group)
    .executeTakeFirst();

  if (!schedule) {
    await refreshSchedule(session);
    schedule = await db
      .selectFrom("schedule")
      .select(["data"])
      .where("group", "=", user.group)
      .executeTakeFirstOrThrow();
  }

  const data = schedule?.data;

  const currentWeekType = (await fetch(
    "http://localhost:3001/api/hono/openapi/general/getTypeOfWeek",
  ).then((res) => res.text())) as any;
  return c.json({
    uniqueList: [],
    schedule: generateDaysList(currentWeekType, data as any),
  });
});

const rating = createRoute({
  path: "rating",
  method: "get",
  responses: {
    200: {
      description: "returns rating for user",
      content: {
        "application/json": {
          schema: zod.array(
            zod.object({
              number: zod.string(),
              name: zod.string(),
              surname: zod.string(),
              rating: zod.string(),
              type: zod.string(),
              group: zod.string(),
            }),
          ),
        },
      },
    },
  },
});

userRouter.openapi(rating, async (c) => {
  const session = c.get("session");

  if (session.session_id === "joe_biden_session") {
    return c.json(getJoeBidenInfo().rating);
  }

  const user = await db
    .selectFrom("user")
    .selectAll()
    .where("id", "=", session.user_id)
    .executeTakeFirstOrThrow();

  const cachedRating = await cacheClient
    .get<string | undefined>(
      `rating:${user.faculty_id}.${user.course}.${cyrb53(user.speciality)}`,
    )
    .then((res) => res?.value)
    .catch(() => undefined);

  if (cachedRating) {
    return c.json(JSON.parse(cachedRating));
  }

  const rating = await getRatingPage(session);
  c.header("Cache-Control", "max-age=14400");
  if (rating.length) {
    await cacheClient.set(
      `rating:${user.faculty_id}.${user.course}.${cyrb53(user.speciality)}`,
      JSON.stringify(rating),
      {
        lifetime: 604800,
      },
    );
  }
  return c.json(rating);
});

const individualPlan = createRoute({
  path: "individual plan",
  description:
    "educational individual plan for user with required and selectable subjects ",
  method: "get",
  responses: {
    200: {
      description: "returns plan for current semester",
      content: {
        "application/json": {
          schema: zod.array(zod.string()),
        },
      },
    },
    500: {
      description: "returns error if no individualPlan",
    },
  },
});

userRouter.openapi(individualPlan, async (c) => {
  const session = c.get("session");

  const user = await db
    .selectFrom("user")
    .select(["faculty_id", "group_id", "course"])
    .where("user.id", "=", session.user_id)
    .executeTakeFirstOrThrow();

  const userGroup = await getGroup(user.group_id, user.faculty_id, user.course);

  const plan = await getIndividualPlan(session);

  const currentSemensterPlan = plan.find((el) => {
    const course = el.studyYear[0];
    const semester = (el?.semester || "")[3];
    if (course === user.course && semester === userGroup?.currSem.toString()) {
      return true;
    }
    return false;
  });

  if (!currentSemensterPlan?.required || !currentSemensterPlan.selectable) {
    return c.json([], 500);
  }

  c.header("Cache-Control", "max-age=604800, stale-while-revalidate=86400");

  return c.json([
    ...currentSemensterPlan?.required,
    ...currentSemensterPlan?.selectable,
  ]);
});
