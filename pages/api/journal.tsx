import { NextApiRequest, NextApiResponse } from "next";
import getSession from "utils/getSession";

export default async function JournalRoute(req: NextApiRequest, res: NextApiResponse) {

	const session = await getSession(req);
	res.setHeader("Content-Type", "text/html");

	if (session.error) {
		return res.send("<h1>я не знаю 1</h1>")
	}

	if (!session.data) {
		return res.send("<h1>я не знаю 2</h1>")
	}


	const queryString = Object.entries(req.query).map(([k, v],i) => {
		return `${i!==0 ?"&":""}${k}=${v}`
	}).join("")

	let journalPage = await fetch(`https://isu1.khmnu.edu.ua/isu/dbsupport/students/journals.php?${queryString}`, {
		// body: `jrnId=76943&page=1&start=0&limit=25`,
		headers: {
			"Cookie": `PHPSESSID=${session.data.isu_cookie}`,
			"Content-Type": "application/x-www-form-urlencoded"
		}
	})
		.then(res => res.text())

	//TODO: якщо не вдалося взяти журнал то оновити в базі ключі



	res.send(journalPage
		.replaceAll("../../js/extjs4/locale/ext-lang-ukr.js","https://isu1.khmnu.edu.ua/isu/js/extjs4/locale/ext-lang-ukr.js")
		.replaceAll("journals.js","https://isu1.khmnu.edu.ua/isu/dbsupport/students/journals.js")
		.replaceAll("../../js/extjs4/ext.js","https://isu1.khmnu.edu.ua/isu/js/extjs4/ext.js")
		.replaceAll("../../js/extjs4/resources/css/ext-all.css","https://isu1.khmnu.edu.ua/isu/js/extjs4/resources/css/ext-all.css")
		.replaceAll("jrn/css/journals.css","https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/css/journals.css")
		
		)


}