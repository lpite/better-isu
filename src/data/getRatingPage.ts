import { API_URL } from "@/config";
import encodeParamString from "@/utils/encodeParamString";
import parse from "node-html-parser";

export async function getRatingPage(token: string) {
  console.log(token);
  const firstPage = await fetch(
    `${API_URL}/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/students/rating.php`,
    {
      headers: {
        Authorization: token,
      },
    },
  )
    .then((r) => r.text())
    .then((r) => parse(r));
  const href = firstPage
    .querySelector("#TabLeftBorderLink")
    ?.getAttribute("href")
    ?.split("'")[1]
    .split("'")[0];

  const semsetersBody = `mode=SubTable&key=${href}&ref=&sort=&FieldChoice=&TabNo=1&RecsAdded=&FilterMode=&FieldChoiceMode=&PageNo=1&PageSize=200&RecsDeleted=&RecsCount=1&KeyStr=&TabStr=0&PgNoStr=&PgSzStr=&FilterStr=&FieldChoiceStr=&SortStr=&ModeStr=&FieldStr=&ChildStr=&ParamStr=`;

  const semsetersPage = await fetch(
    `${API_URL}/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/students/rating.php`,
    {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: semsetersBody,
    },
  )
    .then((r) => r.text())
    .then((r) => parse(r));

  const linksArray = semsetersPage
    .querySelectorAll("#MainTab")[1]
    .querySelectorAll("a#TabLeftBorderLink");
  const lastSemesterLink = linksArray[linksArray.length - 2]
    .getAttribute("href")
    ?.split("'")[1]
    .split("'")[0];
  const paramStr = semsetersPage
    .querySelector("[name=ParamStr]")
    ?.getAttribute("value");
  const keyStr = semsetersPage
    .querySelector("[name=KeyStr]")
    ?.getAttribute("value");

  const ratingBody = `mode=SubTable&key=${lastSemesterLink?.replaceAll("^", "%5E")}&ref=&sort=&FieldChoice=&TabNo=5&RecsAdded=&FilterMode=&FieldChoiceMode=&PageNo=1&PageSize=200&RecsDeleted=0&RecsCount=4&KeyStr=${encodeParamString(keyStr)}&TabStr=0%7C%7E%7C1&PgNoStr=1%7C%7E%7C&PgSzStr=200%7C%7E%7C&FilterStr=%7C%7E%7C&FieldChoiceStr=%7C%7E%7C&SortStr=%7C%7E%7C&ModeStr=%7C%7E%7CSubTable&FieldStr=&ChildStr=&ParamStr=${encodeParamString(paramStr)}`;
  const ratingPage = await fetch(
    `${API_URL}/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/students/rating.php`,
    {
      method: "POST",
      headers: {
        Authorization: token,
        // "Content-Type": "application/x-www-form-urlencoded",
      },
      body: ratingBody,
    },
  )
    .then((r) => r.text())
    .then((r) => parse(r));
  const ratingTableRows = ratingPage
    .querySelectorAll("#MainTab")[2]
    .querySelectorAll("tr")
    .slice(2);

  const ratingArray = ratingTableRows.map((row) => {
    const cells = row.querySelectorAll("td");
    const number = cells[2]?.textContent;
    const rating = cells[3]?.textContent;
    const name = cells[5]?.textContent;
    const surname = cells[4]?.textContent;
    const group = cells[8]?.textContent;
    const type = cells[7]?.textContent;

    return { number, name, rating, surname, group, type };
  });
  return ratingArray.slice(0, -1);
}
