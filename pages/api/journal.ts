import { NextApiRequest, NextApiResponse } from "next";
import { db } from "utils/db";
import getSession, { refreshSubjectsList } from "utils/getSession";

import zod from "zod"

export default async function JournalRoute(req: NextApiRequest, res: NextApiResponse) {

	const querySchema = zod.object({
		index: zod.string().min(1)
	})

	const query = querySchema.parse(req.query)

	const session = await getSession(req);

	res.setHeader("Content-Type", "text/html");

	if (session.error) {
		return res.send("<h1>я не знаю 1</h1>")
	}

	if (!session.data) {
		return res.send("<h1>я не знаю 2</h1>")
	}

	const { data } = await db.selectFrom("subjects_list")
		.select(["data"])
		.where("user_id", "=", session.data?.user_id)
		.executeTakeFirstOrThrow()

	const { link: journal_link } = JSON.parse(data?.toString() || "")[query.index];

	let journalPage = await fetch(`https://isu1.khmnu.edu.ua/isu/dbsupport/students/journals.php?key=${journal_link}`, {
		headers: {
			"Cookie": `PHPSESSID=${session.data.isu_cookie}`,
			"Content-Type": "application/x-www-form-urlencoded"
		}
	})
		.then(res => res.text())

	if (journalPage.includes("Key violation")) {
		await refreshSubjectsList(session.data);
		return res.redirect(`/api/journal/?index=${query.index}`)
	}

	res.send(journalPage
		.replaceAll("../../js/extjs4/locale/ext-lang-ukr.js", "https://isu1.khmnu.edu.ua/isu/js/extjs4/locale/ext-lang-ukr.js")
		.replaceAll("journals.js", "https://isu1.khmnu.edu.ua/isu/dbsupport/students/journals.js")
		.replaceAll("../../js/extjs4/ext.js", "https://isu1.khmnu.edu.ua/isu/js/extjs4/ext.js")
		.replaceAll("../../js/extjs4/resources/css/ext-all.css", "https://isu1.khmnu.edu.ua/isu/js/extjs4/resources/css/ext-all.css")
		.replaceAll("jrn/css/journals.css", "https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/css/journals.css")
	)
}