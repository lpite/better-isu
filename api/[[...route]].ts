export const config = {
  runtime: "edge",
  api: {
    bodyParser: false,
  },
};
console.log(process.env)
const decoder = new TextDecoder("windows-1251");
import getScheduleByApi from "../backend/utils/getScheduleByApi";
import getFacultets from "../backend/utils/getFacultets";

import { getTypeOfWeek } from "../src/data/getTypeOfWeek";
import { generateDaysList } from "../src/utils/generateDaysList";

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { handle } from "hono/vercel";
import getGroups from "../backend/utils/getGroups";
import { z } from "zod";

const app = new Hono().basePath("/api");

app.get("/schedule", async (c) => {
  const { groupName, course, facultyName } = c.req.query();
  const facultets = await getFacultets();

  const faculty = facultets.find((el) => el.facultyName === facultyName);

  if (!faculty) {
    console.error("no faculty");

    return c.json({});
  }

  const groups = await getGroups(faculty.facultyId, course);
  const group = groups.find((el) => el.groupName === groupName);
  if (!group) {
    console.error("no group");
    return c.json({});
  }
  const schedule = await getScheduleByApi(
    group?.groupId,
    faculty.facultyId,
    course,
  );
  const currentWeekType = await getTypeOfWeek();
  const scheduleResponse = generateDaysList(currentWeekType, schedule as any);

  return c.json({ schedule:scheduleResponse });
  return c.json({
    message: "Hello Next.js!",
  });
});

app.get(
  "/group",
  zValidator(
    "query",
    z.object({
      groupName: z.string(),
      course: z.string(),
      facultyName: z.string(),
    }),
  ),
  async (c) => {
    const { groupName, course, facultyName } = c.req.valid("query");
    const facultets = await getFacultets();

    const faculty = facultets.find((el) => el.facultyName === facultyName);

    if (!faculty) {
      console.error("no faculty");

      return c.json({});
    }
    const groups = await getGroups(faculty.facultyId, course);
    const group = groups.find((el) => el.groupName === groupName);
    if (!group) {
      console.error("no group");
      return c.json({});
    }
    return c.json(group);
  },
);

app.get("/proxy", async (c) => {
  const { url } = c.req.query();
  const auth = c.req.header("Authorization");

  if (!url) {
    return c.text("");
  }
  const r = await fetch(url, {
    headers: {
      Cookie: auth ? "PHPSESSID=" + auth : "",
    },
    credentials: "include",
    redirect: "manual",
    mode:"no-cors"
  })
    .then((r) => r.arrayBuffer())
    .then((r) => decoder.decode(r))
    .catch((err) => {
      console.error(err);
      return "";
    });
  return c.text(r);
});

app.post("/proxy", async (c) => {
  const { url } = c.req.query();
  const auth = c.req.header("Authorization");

  if (!url) {
    return c.text("");
  }

  const body = await c.req.formData();

  const response = fetch(url, {
    method: "POST",
    //@ts-ignore
    body: new URLSearchParams(body).toString(),
    headers: {
      Cookie: auth ? "PHPSESSID=" + auth : "",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    credentials: "include",
    redirect: "manual",
    mode:"no-cors"
  });

  const pageText = await response
    .then((r) => r.arrayBuffer())
    .then((r) => decoder.decode(r))
    .catch((err) => {
      console.error(err);
      return "";
    });
  (await response).headers.forEach((v, k) => {
    c.header(k, v.replace("PHPSESSID", "isu_cookie").replace("HttpOnly", ""));
  });

  return c.text(pageText);
});

export const GET = handle(app);
export const POST = handle(app);
