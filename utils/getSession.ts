import { NextApiRequest } from "next";
import { db } from "./db";
import { Session } from "../types/session";
import { decryptText } from "./encryption";
import { sql } from "kysely";
import { getSubjectsPage } from "./getPage";

export default async function getSession(req: NextApiRequest): Promise<{
	error?: "unauthorized" | "no session",
	data: Session | null
}> {
	const sessionCookie = req.cookies?.session;
	if (!sessionCookie) {
		return {
			error: "unauthorized",
			data: null
		}
	}
	const session = await db.selectFrom("session")
		.selectAll()
		.where("session_id", "=", sessionCookie)
		.executeTakeFirst()


	if (!session) {
		return {
			error: "no session",
			data: null
		}
	}


	const now = new Date().getTime() - (new Date().getTimezoneOffset() * 60);
	
	if (now - session.created_at.getTime() > 28 * 60 * 1000) {
		const newSession = await refreshSession(session);
		if (!newSession) {
			return {
				error: "unauthorized",
				data: null
			}
		}
		await refreshSubjectsList(newSession);

		return {
			data: newSession
		}
		
	}
	return {
		data: session
	}
}



async function refreshSession(session: Session) {

	const user = await db.selectFrom("user")
		.selectAll()
		.where("id", "=", session.user_id)
		.executeTakeFirst()

	if (!user) {
		console.error("can't refresh session");
		return null
	}

	const credentials = JSON.parse(decryptText(user.credentials, process.env.ENCRYPTION_KEY || ""));

	const formData = new FormData()
	formData.append("login", credentials.login);
	formData.append("passwd", credentials.password);
	formData.append("btnSubmit", "%D3%E2%B3%E9%F2%E8");

	const res = await fetch("https://isu1.khmnu.edu.ua/isu/dbsupport/logon.php", {
		method: "POST",
		body: formData,
		cache: "no-cache",
		credentials: "include",
		redirect: "manual"
	})

	const cookie = res.headers.getSetCookie().toString().split("=")[1].split(";")[0];

	const newSession = await db.updateTable("session")
		.set({
			isu_cookie: cookie,
			created_at: sql`now()`
		})
		.where("id", "=", session.id)
		.returningAll()
		.executeTakeFirst()
	return newSession;

}


async function refreshSubjectsList(session: Session) {
	const subjects = await getSubjectsPage(session);
	await db.updateTable("subjects_list")
		.set({
			data: JSON.stringify(subjects)
		})
		.where("user_id", "=", session.user_id)
		.execute()



}

