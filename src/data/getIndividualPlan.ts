import parse from "node-html-parser";

export default async function getIndividualPlan(
  token: string,
  course: string,
  semester: string,
) {
  const firstPageResponse = await fetch(
    "/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php",
    {
      headers: {
        Authorization: token,
      },
    },
  ).then((r) => r.text());
  const firstPage = parse(firstPageResponse);
  const firstPageKey = firstPage
    ?.querySelectorAll("#TabLeftBorderLink")[0]
    ?.getAttribute("href")
    ?.split("'")[1]
    ?.split("'")[0];

  if (!firstPageKey) {
    console.error("cant find key on first page");
    return [];
  }

  const individualPlanReponse = await fetch(
    "/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php",
    {
      headers: {
        Authorization: token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: `mode=SubTable&key=${firstPageKey.replaceAll("^", "%5E")}&ref=&sort=&FieldChoice=&TabNo=1&RecsAdded=&FilterMode=&FieldChoiceMode=&PageNo=1&PageSize=200&RecsDeleted=&RecsCount=1&KeyStr=&TabStr=0&PgNoStr=&PgSzStr=&FilterStr=&FieldChoiceStr=&SortStr=&ModeStr=&FieldStr=&ChildStr=&ParamStr=`,
    },
  ).then((r) => r.text());
  const individualPlan = parse(individualPlanReponse);
  const tableRows = individualPlan
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
  console.log(tableRows.length);
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
  // return arr;
  console.log(arr, course, semester);

  const currentSemensterPlan = arr.find((el) => {
    const _course = el.studyYear[0];
    const _semester = (el?.semester || "")[3];
    if (_course === course && _semester === semester) {
      return true;
    }
    return false;
  });

  if (!currentSemensterPlan?.required || !currentSemensterPlan.selectable) {
    console.error("no currentSemensterPlan");
    return [];
  }
  return [
    ...currentSemensterPlan?.required,
    ...currentSemensterPlan?.selectable,
  ];
}
