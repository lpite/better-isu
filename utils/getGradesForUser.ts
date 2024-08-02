import zod from "zod";
import { cacheClient } from "./memcached";

export const DaySchema = zod.object({
  RECORDBOOK: zod.string(),
  MONTHSTR: zod.string(),
  DAYNUM: zod.string(),
  CONTROLSHORTNAME: zod.string(),
  GRADE: zod.string(),
  LFP: zod.string(),
});

type Day = zod.infer<typeof DaySchema>;

type GetGradesParams = {
  isu_cookie?: string;
  journalId: string;
  groupId: number;
  recordNumber: string;
};

export default async function getGradesForUser({
  isu_cookie,
  groupId,
  journalId,
  recordNumber,
}: GetGradesParams): Promise<Day[]> {
  const cachedGrades = await cacheClient
    .get<string | undefined>(`grades:${groupId}.${journalId}`)
    .then((res) => {
      return res.value;
    })
    .catch((err) => {
      console.error(err);
      return undefined;
    });

  if (cachedGrades) {
    console.log("using cache for grades");
    return JSON.parse(cachedGrades).filter(
      (el: Day) => el.RECORDBOOK.trim() === recordNumber,
    );
  }

  const grades = await fetch(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/jrngrades.php",
    {
      headers: {
        Cookie: `PHPSESSID=${isu_cookie}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: `grp=${groupId}&jrn=${journalId}&page=1&start=0&limit=25`,
    },
  )
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
      return [];
    });

  cacheClient.set(`grades:${groupId}.${journalId}`, JSON.stringify(grades), {
    lifetime: 600,
  });

  return grades.filter((el: Day) => el.RECORDBOOK.trim() === recordNumber);
}
