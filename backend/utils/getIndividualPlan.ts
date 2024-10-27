import { Session } from "types/session";
import fetchAndDecode from "./fetchAndDecode";

export default async function getIndividualPlan(session: Session) {
  const firstPage = await fetchAndDecode(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php",
    {
      headers: {
        Cookie: `PHPSESSID=${session.isu_cookie}`,
      },
    },
  );
  const firstPageKey = firstPage.html
    ?.querySelectorAll("#TabLeftBorderLink")[0]
    ?.getAttribute("href")
    ?.split("'")[1]
    ?.split("'")[0];

  if (!firstPageKey) {
    console.error("cant find key on first page");
    return [];
  }

  const individualPlan = await fetchAndDecode(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php",
    {
      headers: {
        Cookie: `PHPSESSID=${session.isu_cookie}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: `mode=SubTable&key=${firstPageKey.replaceAll("^", "%5E")}&ref=&sort=&FieldChoice=&TabNo=1&RecsAdded=&FilterMode=&FieldChoiceMode=&PageNo=1&PageSize=200&RecsDeleted=&RecsCount=1&KeyStr=&TabStr=0&PgNoStr=&PgSzStr=&FilterStr=&FieldChoiceStr=&SortStr=&ModeStr=&FieldStr=&ChildStr=&ParamStr=`,
    },
  );

  const tableRows = individualPlan.html
    .querySelectorAll("#MainTab")[1]
    .querySelectorAll("tr");

  type Plan = {
    studyYear: string;
    semester?: string;
    required?: string[];
    selectable?: string[];
  };

  let obj = {} as Plan;
  const arr: Plan[] = [];

  let currentSubjects: "required" | "selectable" = "required";

  for (const [i, row] of tableRows.entries()) {
    if (row.querySelector("#TabGroupTitle1")) {
      // лінія в якій рік навчання
      // ПРИКЛАД: 1 курс (рік навчання) 2022-2023 н.р.
      if (Object.keys(obj).length) {
        arr.push(obj);
        obj = {} as Plan;
      }
      obj["studyYear"] =
        row.querySelector("#TabGroupTitle1")?.textContent || "";
    }

    if (row.querySelector("#TabGroupTitle2")) {
      // лінія в якій семестр
      // ПРИКЛАД: 1 (1) семестр

      if (Object.keys(obj).length !== 1) {
        // перевірка чи це не перша лінія про семестр

        arr.push(obj);
        const studyYear = obj.studyYear;

        obj = { studyYear };
      }
      obj["semester"] = row.querySelector("#TabGroupTitle2")?.textContent || "";

      currentSubjects = "required";
    }

    if (row.querySelector("#TabGroupTitle3")) {
      // лінія в якій тип предметів які будуть наступні
      // ПРИКЛАД: Обов'язкові або Вибіркові

      if (
        row.querySelector("#TabGroupTitle3")?.textContent?.trim() ===
        "Вибіркові"
      ) {
        currentSubjects = "selectable";
      }
    }
    if (row.querySelector("#TabCell,#TabCell2")) {
      // лінія в якій дійсно запис
      const cells = row.querySelectorAll("#TabCell,#TabCell2");

      obj[currentSubjects] = [
        ...(obj[currentSubjects] || []),
        cells[1].textContent,
      ];
    }
    if (i + 1 === tableRows.length) {
      arr.push(obj);
    }
  }
  return arr;
}
