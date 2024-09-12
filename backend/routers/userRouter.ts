import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { db } from "utils/db";
import { z as zod } from "@hono/zod-openapi";
import { Session } from "types/session";
import { sessionMiddleware } from "backend/middlewares/sessionMiddleware";
import { sql } from "kysely";
import { refreshSubjectsList } from "utils/getSession";
import getRatingPage from "utils/getRatingPage";
import { getJoeBidenInfo } from "utils/getJoeBidenInfo";
import { refreshSchedule } from "utils/refreshSchedule";
import { cacheClient } from "utils/memcached";
import { cyrb53 } from "utils/hash";
import getIndividualPlan from "utils/getIndividualPlan";
import { getGroup } from "utils/getGroups";

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
          schema: zod.array(
            zod.object({
              name: zod.string(),
              day: zod.string(),
              number: zod.string(),
              type: zod.enum(["up", "bottom", "full"]),
              dateFrom: zod.string(),
              dateTo: zod.string(),
              auditory: zod.string(),
              subjectName: zod.string(),
              isSelectable: zod.boolean(),
            }),
          ),
        },
      },
    },
  },
});

userRouter.openapi(schedule, async (c) => {
  const session = c.get("session");

  if (session.session_id === "joe_biden_session") {
    return c.json(getJoeBidenInfo().schedule);
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

  return c.json(schedule.data as any);
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
