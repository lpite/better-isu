import { db } from "./db";
import { getGroup } from "./getGroups";

type ScheduleItem = {
  streamId: number;
  numYear: number;
  numSemester: number;
  subGroup: string;
  studyTypeId: number;
  studyTypeShortName?: null;
  subjectId: number;
  subjectName: string;
  subjectABBR: string;
  teacherPhoto: string;
  teacherFullName: string;
  teacherShortName: string;
  dateFrom: string;
  dateTo: string;
  weeklyLoad: string;
  weekId: 0 | 1 | 2;
  weekName?: null | "Чис. ";
  dayOfWeek: number;
  dayName: string;
  pairNum: number;
  audName: string;
  groupId: number;
  groupName: string;
  isSubGroup: string;
};

export default async function getScheduleByApi(user_id: number) {
  const user = await db
    .selectFrom("user")
    .select(["group_id", "faculty_id", "course"])
    .where("user.id", "=", user_id)
    .executeTakeFirstOrThrow();

  const formDataWithKey = new FormData();
  formDataWithKey.append("schedAppKey", process.env.ISU_API_KEY || "");

  const group = await getGroup(user.group_id, user.faculty_id, user.course);

  if (!group) {
    console.error("can`t find user group");
    return [];
  }

  let studYear = new Date().getFullYear();
  let currentSemester = "1";

  if (group.currSem % 2 === 0) {
    studYear--;
    currentSemester = "2";
  }

  formDataWithKey.append("groupId", group.groupId.toString());
  formDataWithKey.append("studyYear", studYear.toString());
  formDataWithKey.append("semester", currentSemester);

  const schedule = (await fetch(
    "https://isu1.khmnu.edu.ua/isu/pub/api/v1/getScheduleForGroup.php",
    {
      method: "POST",
      body: formDataWithKey,
    },
  )
    .then((res) => res.json())
    .catch((_) => [])) as ScheduleItem[];

  const pairTypes = ["full", "up", "bottom"];
  const studyTypes = ["", "лекц.", "пр.", "лаб."];

  return schedule.map((el) => {
    return {
      day: el.dayName,
      number: el.pairNum,
      type: pairTypes[el.weekId],
      name: `${studyTypes[el.studyTypeId]} ${el.subjectName} ${el.audName} ${el.teacherShortName}`,
      dateFrom: el.dateFrom,
      dateTo: el.dateTo,
    };
  });
}
