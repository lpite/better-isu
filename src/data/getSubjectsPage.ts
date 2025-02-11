import parse from "node-html-parser";

export async function getSubjectsPage(token: string = "") {
  try {
    const decoder = new TextDecoder("windows-1251");

    const firstPage = await fetch(
      "/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php",
      {
        headers: {
          Authorization: token,
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
      "/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php",
      {
        method: "POST",
        body: `mode=SubTable&key=${firstPageKey}&ref=&sort=&FieldChoice=&TabNo=2&RecsAdded=&FilterMode=&FieldChoiceMode=&PageNo=1&PageSize=200&RecsDeleted=&RecsCount=1&KeyStr=&TabStr=0&PgNoStr=&PgSzStr=&FilterStr=&FieldChoiceStr=&SortStr=&ModeStr=&FieldStr=&ChildStr=&ParamStr=`,
        headers: {
          Authorization: token,
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
      secondPageHtml?.querySelectorAll("[color=blue]")[1]?.textContent;

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
    // thirdPageBody = thirdPageBody.replaceAll("^", "%5E");
    // thirdPageBody = thirdPageBody.replaceAll("|", "%7C");
    // thirdPageBody = thirdPageBody.replaceAll("@", "%40");
    // thirdPageBody = thirdPageBody.replaceAll("~", "%7E");
    const thirdPage = await fetch(
      "/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/students/eduplans.php",
      {
        method: "POST",
        body: thirdPageBody,
        headers: {
          Authorization: token,
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
