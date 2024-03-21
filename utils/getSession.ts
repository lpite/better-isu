import { NextApiRequest } from "next";
import { db } from "./db";
import { Session } from "../types/session";
import { decryptText } from "./encryption";
import { sql } from "kysely";
import { getProfilePage, getSchedulePage, getSubjectsPage } from "./getPage";
import { parseScheduleTable } from "./parseScheduleTable";

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

	// refreshSchedule(session)

	const now = new Date().getTime() - (new Date().getTimezoneOffset() * 60);
	
	if (now - session.created_at.getTime() > 55 * 60 * 1000) {
		const newSession = await refreshSession(session);
		if (!newSession) {
			return {
				error: "unauthorized",
				data: null
			}
		}
		await refreshSubjectsList(newSession);
		await refreshUserInfo(newSession)
		// await Promise.all([refreshSubjectsList(newSession), refreshUserInfo(newSession)])

		return {
			data: newSession
		}
		
	}
	return {
		data: session
	}
}



async function refreshSession(session: Session) {
	console.log("refreshing session")

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


export async function refreshSubjectsList(session: Session) {
	const subjects = await getSubjectsPage(session);
	console.log("refreshing subjects")
	const subjectsList = await db.updateTable("subjects_list")
		.set({
			data: JSON.stringify(subjects)
		})
		.where("user_id", "=", session.user_id)
		.returningAll()
		.executeTakeFirst()

	if (!subjectsList) {
		await db.insertInto("subjects_list")
			.values({
				data: JSON.stringify(subjects),
				user_id: session.user_id
			})
			.executeTakeFirstOrThrow()

	}
}


export async function refreshUserInfo(session: Session) {
	const { name, surname, faculty, group, recordNumber, course } = await getProfilePage(session);

	await db.updateTable("user")
		.set({
			name,
			surname,
			faculty,
			group,
			record_number: recordNumber,
			course
		})
		.where("user.id", "=", session.user_id)
		.execute()
};

export async function refreshSchedule(session: Session) {
	console.log("REFRESHING SCHEDULE LIST");
	
	const user = await db.selectFrom("user")
		.select("group")
		.where("user.id", "=", session.user_id)
		.executeTakeFirstOrThrow()

	const schedule = await db.selectFrom("schedule")
		.select("id")
		.where("group", "=", user.group)
		.executeTakeFirst()

	if (!schedule?.id) {

		if (!user.group) {
			throw "no user group"
		}

		const schedulePage = await getSchedulePage(session);
		const jsonSchedule = parseScheduleTable(schedulePage);
		await db.insertInto("schedule")
			.values({
				group: user.group,
				data: JSON.stringify(jsonSchedule)
			})
			.executeTakeFirstOrThrow()
	}


}

