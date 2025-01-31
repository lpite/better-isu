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

export default async function getScheduleByApi(
  group_id: number,
  faculty_id: number,
  course: string,
) {
  const formDataWithKey = new FormData();
  formDataWithKey.append("schedAppKey", process.env.ISU_API_KEY || "");

  const group = await getGroup(group_id, faculty_id, course);

  if (!group) {
    console.error("can`t find user group");
    return [];
  }

  let studYear = new Date().getFullYear();
  let currentSemester = "1";

  if (group.currSem % 2 !== 0) {
    studYear--;
    currentSemester = "2";
  }

  formDataWithKey.append("groupId", group.groupId.toString());
  formDataWithKey.append("studyYear", studYear.toString());
  formDataWithKey.append("semester", currentSemester);
  console.log(formDataWithKey)
  const schedule = (await fetch(
    "https://isu1.khmnu.edu.ua/isu/pub/api/v1/getScheduleForGroup.php",
    {
      method: "POST",
      body: formDataWithKey,
    },
  )
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
      return [];
    })) as ScheduleItem[];

  const pairTypes = ["full", "up", "bottom"];
  const studyTypes = ["", "лекц.", "пр.", "лаб."];

  return schedule.map((el) => {
    return {
      day: el.dayName,
      number: el.pairNum,
      type: pairTypes[el.weekId],
      name: `${studyTypes[el.studyTypeId]} ${el.subjectName}`,
      auditory: el.audName,
      subjectName: el.subjectName,
      teacherShortName: el.teacherShortName,
      teacherFullName: el.teacherFullName,
      // Вказує на те чи є цей предмет вибірковим.
      isSelectable: el.isSubGroup === "Y" ? true : false,
      dateFrom: el.dateFrom,
      dateTo: el.dateTo,
    };
  });
}
