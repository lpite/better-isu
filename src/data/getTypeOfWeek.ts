import parse from "node-html-parser";

const decoder = new TextDecoder("windows-1251");

export async function getTypeOfWeek() {
  const text = await fetch("https://isu1.khmnu.edu.ua/isu/dbsupport/logon.php")
    .then((r) => r.arrayBuffer())
    .then((r) => decoder.decode(r));
  const html = parse(text);
  const typeOfWeek = html
    .querySelector(".logo-time")
    ?.textContent?.split(".")[1]
    ?.trim();

  let response: "up" | "bottom" = "up";
  if (typeOfWeek === "Знаменник") {
    response = "bottom";
  }
  return response;
}
