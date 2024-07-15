import { parse } from "node-html-parser";
import { Session } from "types/session";
import { db } from "./db";
import encodeParamString from "./encodeParamString";
import fetchAndDecode from "./fetchAndDecode";

export async function getProfilePage(session: Session) {
  const decoder = new TextDecoder("windows-1251");

  const eduplansPage = await fetch(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php",
    {
      headers: {
        Cookie: `PHPSESSID=${session.isu_cookie}`,
      },
    },
  )
    .then((res) => res.arrayBuffer())
    .then((res) => decoder.decode(res))
    .catch((res) => {
      return "";
    });

  const tableCells = parse(eduplansPage).querySelectorAll("#TabCell");

  const { html: profileHtml } = await fetchAndDecode(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/students/personnel.php",
    {
      headers: {
        Cookie: `PHPSESSID=${session.isu_cookie}`,
      },
    },
  );

  const profileCells =
    profileHtml?.querySelector("#MainTab")?.querySelectorAll("#TabCell") || [];

  const profile = {
    name: tableCells[2].textContent,
    surname: tableCells[1].textContent,
    fathersName: tableCells[3].textContent,
    recordNumber: tableCells[9].textContent,
    faculty: tableCells[4].textContent,
    speciality: tableCells[5].textContent,
    group: tableCells[7].textContent,
    course: tableCells[10].textContent,
    birthDate: profileCells[profileCells?.length - 1].textContent,
  };

  return profile;
}

export async function getSubjectsPage(session: Session) {
  try {
    const decoder = new TextDecoder("windows-1251");

    const firstPage = await fetch(
      "https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php",
      {
        headers: {
          Cookie: `PHPSESSID=${session.isu_cookie}`,
        },
      },
    )
      .then((res) => res.arrayBuffer())
      .then((res) => decoder.decode(res));
    if (!firstPage) {
      console.error("no eduplans page 1");
      return [];
    }

    const firstPageHtml = parse(firstPage);

    const firstPageKey = firstPageHtml
      .querySelector("#TabLeftBorderLink")
      ?.getAttribute("href")
      ?.split("'")[1];

    const secondPage = await fetch(
      "https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php",
      {
        method: "POST",
        body: `mode=SubTable&key=${firstPageKey}&ref=&sort=&FieldChoice=&TabNo=2&RecsAdded=&FilterMode=&FieldChoiceMode=&PageNo=1&PageSize=200&RecsDeleted=&RecsCount=1&KeyStr=&TabStr=0&PgNoStr=&PgSzStr=&FilterStr=&FieldChoiceStr=&SortStr=&ModeStr=&FieldStr=&ChildStr=&ParamStr=`,
        headers: {
          Cookie: `PHPSESSID=${session.isu_cookie}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    )
      .then((res) => res.arrayBuffer())
      .then((res) => decoder.decode(res));

    if (!secondPage) {
      console.error("no eduplans page 2");
      return [];
    }
    const secondPageHtml = parse(secondPage);

    let keyStr =
      secondPageHtml.querySelector("[name=KeyStr]")?.getAttribute("value") ||
      "";
    let paramStr =
      secondPageHtml.querySelector("[name=ParamStr]")?.getAttribute("value") ||
      "";
    let tableKey = "";

    // Масив всіх елементів в табличці
    // довжина стрічки 6 елементів
    const tableElements = Array.from(
      secondPageHtml
        ?.querySelectorAll("#MainTab")[1]
        ?.querySelectorAll("#TabLeftBorderLink,#TabCell,#TabCell2"),
    );

    if (!tableElements.length) {
      console.error("no tableElements");

      return [];
    }

    const currentSemester =
      secondPageHtml?.querySelector("[color=blue]")?.textContent;

    let tabNo = 6;
    let elementInRow = 0;
    let currentRow: Record<string, string> = {};

    tableElements.forEach((el, i) => {
      if (elementInRow === 6) {
        const date = new Date();
        let currentYearString = `${date.getFullYear()}-${date.getFullYear() + 1}`;

        if (currentSemester === "2") {
          currentYearString = `${date.getFullYear() - 1}-${date.getFullYear()}`;
        }
        if (
          currentSemester === currentRow.semseter &&
          currentYearString === currentRow.years
        ) {
          // tabNo = (i + 1) / 5 + 1;
          tableKey = currentRow.journalLink;
        }

        elementInRow = 0;
      }

      const isJournalLink = elementInRow === 3;
      const isYears = elementInRow === 4;
      const isSemester = elementInRow === 5;

      if (isSemester) {
        currentRow.semseter = el.textContent;
      }
      if (isJournalLink) {
        currentRow.journalLink = el.getAttribute("href")?.split("'")[1] || "";
      }

      if (isYears) {
        currentRow.years = el.textContent.trim() || currentRow.years;
      }
      elementInRow++;
    });
    const letters = [
      "Й",
      "Ц",
      "У",
      "К",
      "Е",
      "Н",
      "Г",
      "Ш",
      "Щ",
      "З",
      "Х",
      "Ф",
      "І",
      "В",
      "А",
      "П",
      "Р",
      "О",
      "Л",
      "Д",
      "Ж",
      "Є",
      "Я",
      "Ч",
      "С",
      "М",
      "И",
      "Т",
      "Ь",
      "Б",
      "Ю",
      "м",
    ];
    const encodedLetters = [
      "%C9",
      "%D6",
      "%D3",
      "%CA",
      "%C5",
      "%CD",
      "%C3",
      "%D8",
      "%D9",
      "%C7",
      "%D5",
      "%D4",
      "%B2",
      "%C2",
      "%C0",
      "%CF",
      "%D0",
      "%CE",
      "%CB",
      "%C4",
      "%C6",
      "%AA",
      "%DF",
      "%D7",
      "%D1",
      "%CC",
      "%C8",
      "%D2",
      "%DC",
      "%C1",
      "%DE",
      "%EC",
    ];

    paramStr = paramStr.replaceAll("&", "%26");

    for (let i = 0; i < paramStr.length; i++) {
      const character = paramStr[i];
      const indexInArray = letters.indexOf(character);
      if (indexInArray !== -1) {
        paramStr = paramStr.replaceAll(character, encodedLetters[indexInArray]);
      }
    }
    let thirdPageBody = `mode=SubTable&key=${tableKey}&ref=&sort=&FieldChoice=&TabNo=${tabNo}&RecsAdded=&FilterMode=&FieldChoiceMode=&PageNo=1&PageSize=20&RecsDeleted=0&RecsCount=4&KeyStr=${keyStr}&TabStr=0%7C%7E%7C2&PgNoStr=1%7C%7E%7C&PgSzStr=200%7C%7E%7C&FilterStr=%7C%7E%7C&FieldChoiceStr=%7C%7E%7C&SortStr=%7C%7E%7C&ModeStr=%7C%7E%7CSubTable&FieldStr=&ChildStr=&ParamStr=${paramStr}`;
    thirdPageBody = thirdPageBody.replaceAll("^", "%5E");
    thirdPageBody = thirdPageBody.replaceAll("|", "%7C");
    thirdPageBody = thirdPageBody.replaceAll("@", "%40");
    thirdPageBody = thirdPageBody.replaceAll("~", "%7E");
    const thirdPage = await fetch(
      "https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php",
      {
        method: "POST",
        body: thirdPageBody,
        headers: {
          Cookie: `PHPSESSID=${session.isu_cookie}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    )
      .then((res) => res.arrayBuffer())
      .then((res) => decoder.decode(res));

    const thirdPageHtml = parse(thirdPage);
    const subjects = Array.from(
      thirdPageHtml
        ?.querySelectorAll("#MainTab")[2]
        ?.querySelectorAll("#TabCell, #TabCell2") || [],
    ).filter((_, i) => {
      if (i % 2 == 0) {
        return true;
      }
      return false;
    });

    if (!subjects.length) {
      console.error("no subjects on thirdPage");
      return [];
    }

    const subjectsList = subjects.map((el, i) => {
      const link = Array.from(
        thirdPageHtml?.querySelectorAll("#TabLeftBorderLink"),
      )
        .slice(0, -1)
        [i]?.getAttribute("href")
        ?.split("'")[3];
      return { name: el.textContent, link: link };
    });

    return subjectsList;
  } catch (err) {
    console.error(err);
    return [];
  }
}

/**
 * @deprecated для цього є функція getScheduleByApi
 */
export async function getSchedulePage(session: Session) {
  const user = await db
    .selectFrom("user")
    .selectAll()
    .where("user.id", "=", session.user_id)
    .executeTakeFirstOrThrow();

  const decoder = new TextDecoder("windows-1251");

  const firstPage = await fetch(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/students/groupsSchedule.php",
    {
      headers: {
        Cookie: `PHPSESSID=${session.isu_cookie}`,
      },
    },
  )
    .then((res) => res.arrayBuffer())
    .then((res) => decoder.decode(res));

  const firstPageHtml = parse(firstPage);

  const firstKey = firstPageHtml
    ?.querySelector("#TabLeftBorder")
    ?.querySelector("a")
    ?.getAttribute("href")
    ?.split("'")[1];
  const secondPage = await fetch(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/students/groupsSchedule.php",
    {
      method: "POST",
      body: `mode=SubTable&key=${firstKey}&ref=&sort=&FieldChoice=&TabNo=1&RecsAdded=&FilterMode=&FieldChoiceMode=&PageNo=1&PageSize=100&RecsDeleted=&RecsCount=12&KeyStr=&TabStr=0&PgNoStr=&PgSzStr=&FilterStr=&FieldChoiceStr=&SortStr=&ModeStr=&FieldStr=&ChildStr=&ParamStr=`,
      headers: {
        Cookie: `PHPSESSID=${session.isu_cookie}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  )
    .then((res) => res.arrayBuffer())
    .then((res) => decoder.decode(res));

  const secondPageHtml = parse(secondPage);

  const secondPageTable = secondPageHtml?.querySelectorAll("#MainTab")[1];

  if (!secondPageTable) {
    throw "no second schedule table";
  }
  const secondPageCells = secondPageTable?.querySelectorAll(
    "#TabCell,#TabCell2,#TabLeftBorder",
  );

  const userFacultyCellIndex = secondPageCells?.findIndex(
    (el) => el.textContent === user.faculty,
  );

  const link = secondPageCells[userFacultyCellIndex - 1]
    ?.querySelector("a")
    ?.getAttribute("href")
    ?.split("'")[1];
  let paramStr = secondPageHtml
    .querySelector("input[name=ParamStr]")
    ?.getAttribute("value");
  let keyStr = secondPageHtml
    .querySelector("input[name=KeyStr]")
    ?.getAttribute("value");

  paramStr = paramStr?.replaceAll("&", "%26").replaceAll("КІ", "%CA%B2");
  // TODO :
  // це не буде працювати з іншими групами
  // вже і не треба бо розклад береться по апішці

  let bodyStr = `mode=SubTable&key=${link}&ref=&sort=&FieldChoice=&TabNo=3&RecsAdded=&FilterMode=&FieldChoiceMode=&PageNo=1&PageSize=50&RecsDeleted=0&RecsCount=11&KeyStr=${keyStr}&TabStr=0%7C%7E%7C1&PgNoStr=1%7C%7E%7C&PgSzStr=100%7C%7E%7C&FilterStr=%7C%7E%7C&FieldChoiceStr=%7C%7E%7C&SortStr=%7C%7E%7C&ModeStr=%7C%7E%7CSubTable&FieldStr=&ChildStr=&ParamStr=${paramStr}`;
  bodyStr = bodyStr.replaceAll("^", "%5E");
  bodyStr = bodyStr.replaceAll("|", "%7C");
  bodyStr = bodyStr.replaceAll("@", "%40");
  bodyStr = bodyStr.replaceAll("~", "%7E");

  const courseSelectionPage = await fetch(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/students/groupsSchedule.php",
    {
      method: "POST",
      body: bodyStr,
      headers: {
        Cookie: `PHPSESSID=${session.isu_cookie}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  )
    .then((res) => res.arrayBuffer())
    .then((res) => decoder.decode(res));

  const courseSelectionPageHtml = parse(courseSelectionPage);

  const courseCells = courseSelectionPageHtml
    .querySelectorAll("#MainTab")[2]
    .querySelectorAll("#TabCell,#TabCell2,#TabLeftBorder");

  const courseCellIndex = courseCells.findIndex(
    (el) => el.textContent === user.course,
  );

  const courseKey = courseCells[courseCellIndex - 1]
    .querySelector("a")
    ?.getAttribute("href")
    ?.split("'")[1];
  const courseParamStr = encodeParamString(
    courseSelectionPageHtml
      .querySelector("input[name=ParamStr]")
      ?.getAttribute("value") || "",
  );
  const courseKeyStr = courseSelectionPageHtml
    .querySelector("input[name=KeyStr]")
    ?.getAttribute("value");

  // courseParamStr.

  let courseBody = `mode=SubTable&key=${courseKey}&ref=&sort=&FieldChoice=&TabNo=4&RecsAdded=&FilterMode=&FieldChoiceMode=&PageNo=1&PageSize=200&RecsDeleted=0&RecsCount=7&KeyStr=${courseKeyStr}&TabStr=0%7C%7E%7C1%7C%7E%7C3&PgNoStr=1%7C%7E%7C1%7C%7E%7C&PgSzStr=100%7C%7E%7C50%7C%7E%7C&FilterStr=%7C%7E%7C%7C%7E%7C&FieldChoiceStr=%7C%7E%7C%7C%7E%7C&SortStr=%7C%7E%7C%7C%7E%7C&ModeStr=%7C%7E%7CSubTable%7C%7E%7CSubTable&FieldStr=&ChildStr=&ParamStr=${courseParamStr}`;

  courseBody = courseBody.replaceAll("^", "%5E");
  courseBody = courseBody.replaceAll("|", "%7C");
  courseBody = courseBody.replaceAll("@", "%40");
  courseBody = courseBody.replaceAll("~", "%7E");

  const groupSelectionPage = await fetch(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/students/groupsSchedule.php",
    {
      method: "POST",
      body: courseBody,
      headers: {
        Cookie: `PHPSESSID=${session.isu_cookie}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  )
    .then((res) => res.arrayBuffer())
    .then((res) => decoder.decode(res));

  const groupSelectionPageHtml = parse(groupSelectionPage);

  const groupSelectionTable =
    groupSelectionPageHtml.querySelectorAll("#MainTab")[3];
  const groupSelectionCells = groupSelectionTable.querySelectorAll("#TabCell");

  const groupArray = user.group.split("-");

  if (groupArray.length === 3) {
  }
  let chkOp = "";
  const userInfo = user.group.split("-");
  groupSelectionCells.forEach((cell, i) => {
    if (
      cell.textContent === userInfo[0] &&
      groupSelectionCells[i + 1].textContent === `20${userInfo[1]}` &&
      groupSelectionCells[i + 2].textContent === userInfo[2]
    ) {
      chkOp =
        groupSelectionCells[i - 1]
          .querySelector("input")
          ?.getAttribute("value") || "";
    }
  });

  const scheduleKeyStr = groupSelectionPageHtml
    .querySelector("input[name=KeyStr]")
    ?.getAttribute("value");
  const scheduleParamStr = encodeParamString(
    groupSelectionPageHtml
      .querySelector("input[name=ParamStr]")
      ?.getAttribute("value") || "",
  );

  const scheduleBody = `chkOp%5B%5D=${chkOp}&mode=RunOperation&key=&ref=0&sort=&FieldChoice=&TabNo=&RecsAdded=&FilterMode=&FieldChoiceMode=&PageNo=1&PageSize=200&RecsDeleted=0&RecsCount=36&KeyStr=${scheduleKeyStr}&TabStr=0%7C%7E%7C1%7C%7E%7C3%7C%7E%7C4&PgNoStr=1%7C%7E%7C1%7C%7E%7C1%7C%7E%7C&PgSzStr=100%7C%7E%7C50%7C%7E%7C200%7C%7E%7C&FilterStr=%7C%7E%7C%7C%7E%7C%7C%7E%7C&FieldChoiceStr=%7C%7E%7C%7C%7E%7C%7C%7E%7C&SortStr=%7C%7E%7C%7C%7E%7C%7C%7E%7C&ModeStr=%7C%7E%7CSubTable%7C%7E%7CSubTable%7C%7E%7CSubTable&FieldStr=&ChildStr=&ParamStr=${scheduleParamStr}&opWarning=&opGotoPage=groupsSchedulePage.php%3Ftype%3Dgroup&opWarning=&opGotoPage=groupsSchedulePage.php%3Ftype%3Dgroup%26showMode%3DforPrint`;

  const schedulePage = await fetch(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/students/groupsSchedulePage.php?type=group",
    {
      method: "POST",
      body: scheduleBody,
      headers: {
        Cookie: `PHPSESSID=${session.isu_cookie}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  )
    .then((res) => res.arrayBuffer())
    .then((res) => decoder.decode(res));

  return schedulePage;
}
