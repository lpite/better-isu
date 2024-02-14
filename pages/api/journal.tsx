import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "node-html-parser";
import getSession from "utils/getSession";

export default async function JournalRoute(req: NextApiRequest, res: NextApiResponse) {

	const session = await getSession(req);
	// console.log(session)
	res.setHeader("Content-Type", "text/html");

	if (session.error) {
		return res.send("<h1>я не знаю 1</h1>")
	}

	if (!session.data) {
		return res.send("<h1>я не знаю 2</h1>")
	}

	const decoder = new TextDecoder('windows-1251');

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
		// .then(res => res.arrayBuffer())
		// .then(res => decoder.decode(res))
		.then(res => res.text())
	// 	console.log(journalPage)


	// // const journal
	// const journalPageHtml = parse(journalPage);
	// const journalData = journalPageHtml.querySelectorAll("script")[3].textContent?.split("Ext.create('jrn.GradeGrid',")[1].split(');')[0].replace(/\n|\t| /g, "") 
	
	// res.send(journalData);
	res.send(journalPage
		.replaceAll("../../js/extjs4/locale/ext-lang-ukr.js","https://isu1.khmnu.edu.ua/isu/js/extjs4/locale/ext-lang-ukr.js")
		.replaceAll("journals.js","https://isu1.khmnu.edu.ua/isu/dbsupport/students/journals.js")
		.replaceAll("../../js/extjs4/ext.js","https://isu1.khmnu.edu.ua/isu/js/extjs4/ext.js")
		.replaceAll("../../js/extjs4/resources/css/ext-all.css","https://isu1.khmnu.edu.ua/isu/js/extjs4/resources/css/ext-all.css")
		.replaceAll("jrn/css/journals.css","https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/css/journals.css")
		
		)


}