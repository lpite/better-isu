import { parse } from "node-html-parser";
import { Session } from "types/session";

export async function getProfilePage(session: Session) {
  const decoder = new TextDecoder("windows-1251");
  const profilePage = await fetch(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/students/personnel.php",
    {
      method: "POST",
      headers: {
        Cookie: `PHPSESSID=${session.isu_cookie}`,
      },
    }
  ).then((res) => res.arrayBuffer());

  const profilePageText = decoder.decode(profilePage);

  const idkPage = await fetch(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php",
    {
      headers: {
        Cookie: `PHPSESSID=${session.isu_cookie}`,
      },
    }
  )
    .then((res) => res.arrayBuffer())
    .then((res) => decoder.decode(res));

  const recordNumber =
    parse(idkPage).querySelectorAll("#TabCell")[9]?.textContent || "";

  const profilePageHtml = parse(profilePageText);

  const data = profilePageHtml.querySelectorAll("#TabCell");

  const profile = {
    name: data[0].textContent,
    name2: data[1].textContent,
    name3: data[2].textContent,
    birthDate: data[3].textContent,
    recordNumber: recordNumber,
  };

  return profile;
}

export async function getSubjectsPage(session: Session) {
  const decoder = new TextDecoder("windows-1251");

  const firstPage = await fetch(
    "https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php",
    {
      headers: {
        Cookie: `PHPSESSID=${session.isu_cookie}`,
      },
    }
  )
    .then((res) => res.arrayBuffer())
    .then((res) => decoder.decode(res));

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
    }
  )
    .then((res) => res.arrayBuffer())
    .then((res) => decoder.decode(res));

  const secondPageHtml = parse(secondPage);

  let keyStr =
    secondPageHtml.querySelector("[name=KeyStr]")?.getAttribute("value") || "";
  let paramStr =
    secondPageHtml.querySelector("[name=ParamStr]")?.getAttribute("value") ||
    "";
  let tableKey = "";

  // Масив всіх елементів в табличці
  // довжина стрічки 6 елементів
  const tableElements = Array.from(
    secondPageHtml
      .querySelectorAll("#MainTab")[1]
      .querySelectorAll("#TabLeftBorderLink,#TabCell,#TabCell2")
  );

  const currentSemester =
    secondPageHtml.querySelector("[color=blue]")?.textContent;
  let tabNo = 0;

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
        tabNo = (i + 1) / 5 + 1;
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

  paramStr = paramStr.replaceAll("&", "%26").replaceAll("КІ", "%CA%B2");

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
    }
  )
    .then((res) => res.arrayBuffer())
    .then((res) => decoder.decode(res));

  const thirdPageHtml = parse(thirdPage);
  const subjects = Array.from(
    thirdPageHtml
      .querySelectorAll("#MainTab")[2]
      .querySelectorAll("#TabCell, #TabCell2")
  ).filter((el, i) => {
    if (i % 2 == 0) {
      return true;
    }
    return false;
  });

  const subjectsList = subjects.map((el, i) => {
    const link = Array.from(
      thirdPageHtml.querySelectorAll("#TabLeftBorderLink")
    )
      .slice(0, -1)
      [i]?.getAttribute("href")
      ?.split("'")[3];
    return { name: el.textContent, link: link };
  });

  // console.log(subjectsList)
  return subjectsList;
}
