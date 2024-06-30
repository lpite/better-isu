import type { Session } from "../types/session"
import encodeParamString from "./encodeParamString";
/**
 * @description Повертає рейтниг по спеціальності студента
 * 
 */

import fetchAndDecode from "./fetchAndDecode";

export default async function getRatingPage(session: Session) {
	const firstPage = await fetchAndDecode("https://isu1.khmnu.edu.ua/isu/dbsupport/students/rating.php", {
		headers: {
			Cookie: `PHPSESSID=${session.isu_cookie}`,
		},
	});
	const href = firstPage.html.querySelector("#TabLeftBorderLink")?.getAttribute("href")?.split("'")[1].split("'")[0];

	const semsetersBody = `mode=SubTable&key=${href}&ref=&sort=&FieldChoice=&TabNo=1&RecsAdded=&FilterMode=&FieldChoiceMode=&PageNo=1&PageSize=200&RecsDeleted=&RecsCount=1&KeyStr=&TabStr=0&PgNoStr=&PgSzStr=&FilterStr=&FieldChoiceStr=&SortStr=&ModeStr=&FieldStr=&ChildStr=&ParamStr=`; 

	const semsetersPage = await fetchAndDecode("https://isu1.khmnu.edu.ua/isu/dbsupport/students/rating.php", {
		method: "POST",
		headers: {
			Cookie: `PHPSESSID=${session.isu_cookie}`,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: semsetersBody
	})

	const linksArray = semsetersPage.html.querySelectorAll("#MainTab")[1].querySelectorAll("a#TabLeftBorderLink")
	const lastSemesterLink = linksArray[linksArray.length - 2].getAttribute("href")?.split("'")[1].split("'")[0];
	const paramStr = semsetersPage.html.querySelector("[name=ParamStr]")?.getAttribute("value");
	const keyStr = semsetersPage.html.querySelector("[name=KeyStr]")?.getAttribute("value");

	const ratingBody = `mode=SubTable&key=${lastSemesterLink?.replaceAll("^", "%5E")}&ref=&sort=&FieldChoice=&TabNo=5&RecsAdded=&FilterMode=&FieldChoiceMode=&PageNo=1&PageSize=200&RecsDeleted=0&RecsCount=4&KeyStr=${encodeParamString(keyStr)}&TabStr=0%7C%7E%7C1&PgNoStr=1%7C%7E%7C&PgSzStr=200%7C%7E%7C&FilterStr=%7C%7E%7C&FieldChoiceStr=%7C%7E%7C&SortStr=%7C%7E%7C&ModeStr=%7C%7E%7CSubTable&FieldStr=&ChildStr=&ParamStr=${encodeParamString(paramStr)}`
	const ratingPage = await fetchAndDecode("https://isu1.khmnu.edu.ua/isu/dbsupport/students/rating.php", {
		method: "POST",
		headers: {
			Cookie: `PHPSESSID=${session.isu_cookie}`,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: ratingBody
	})

	const ratingTableRows = ratingPage.html.querySelectorAll("#MainTab")[2].querySelectorAll("tr").slice(2);

	const ratingArray = ratingTableRows.map((row) => {
		const cells = row.querySelectorAll("td");
		const number = cells[2]?.textContent
		const rating = cells[3]?.textContent 
		const name = cells[4]?.textContent
		const surname = cells[5]?.textContent
		const group = cells[8]?.textContent
		const type = cells[7]?.textContent

		return { number, name, rating, surname, group, type }

	})
	return ratingArray.slice(0, -1)

}