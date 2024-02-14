import { NextApiRequest, NextApiResponse } from "next";
import { parse } from 'node-html-parser';
import { db } from "../../utils/db";
import getSession from "../../utils/getSession";

export default async function ProfileRoute(req: NextApiRequest, res: NextApiResponse) {

	const s = await getSession(req);

	if (!s.data) {
		return res.send(s)
	}

	if (req.cookies?.session) {
		const session = await db.selectFrom("session")
			.selectAll()
			.where("session_id", "=", req.cookies.session)
			.executeTakeFirst()
		if (!session?.id) {
			return res.send("no auth")    
		}
	}


	const page = await fetch("https://isu1.khmnu.edu.ua/isu/dbsupport/students/personnel.php", {
		method: "POST",
		headers: {
			"Cookie": `PHPSESSID=${s.data.isu_cookie}`
		}
			
	}).then(res => res.arrayBuffer())

	const decoder = new TextDecoder('windows-1251');
	const text = decoder.decode(page);
	res.setHeader("Content-Type", "text/html; charset=utf-8")

	if (!text.includes("Персональна сторінка студента")) {
		return res.send({})

	}

	const html = parse(text);

	const data = html.querySelectorAll("#TabCell");

	const profile = {
		name: data[0].textContent,
		name2: data[1].textContent,
		name3: data[2].textContent,
		birthDate: data[3].textContent,


	}

	res.send({ data: profile, error: null })
}