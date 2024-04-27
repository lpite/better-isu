import { NextApiRequest } from "next";
import { db } from "./db";
import { Session } from "../types/session";
import { decryptText } from "./encryption";
import { sql } from "kysely";
import { getProfilePage, getSubjectsPage } from "./getPage";
import getScheduleByApi from "./getScheduleByApi";
import getFacultets from "./getFacultets";
import getGroups from "./getGroups";


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
		.executeTakeFirst();
	

	if (!session) {
		return {
			error: "no session",
			data: null
		}
	}

	await db.deleteFrom("session_update_state")
		.where((eb) => eb.and([
			eb("session", "=", session?.session_id),
			eb("created_at", "<", sql<any>`now() - INTERVAL '1 minutes'`)	
		]))
		.execute()
	

	const now = new Date().getTime() - (new Date().getTimezoneOffset() * 60);
	if ((now - session.created_at.getTime() > 55 * 60 * 1000)) {
		const { numInsertedOrUpdatedRows: isNotUpdating } = await db.insertInto("session_update_state")
			.values({
				session: sessionCookie
			})

			.executeTakeFirst().catch(() => {
				return {
					insertId: undefined,
					numInsertedOrUpdatedRows: 0
				}
			})
			
		if (isNotUpdating) {
			const newSession = await refreshSession(session);
			if (!newSession) {
				return {
					error: "unauthorized",
					data: null
				}
			}

			await Promise.all([
				refreshUserInfo(newSession),
				refreshSubjectsList(newSession),
				refreshSchedule(newSession),
				db.deleteFrom("session_update_state")
					.where("session", "=", sessionCookie)
					.execute()
			])

			return {
				data: newSession
			}
		}

		
	}
	return {
		data: session
	}
}

async function refreshSession(session: Session) {
	try {
		console.log("refreshing session")
		const user = await db.selectFrom("user")
			.selectAll()
			.where("id", "=", session.user_id)
			.executeTakeFirst()

		if (!user) {
			console.error("can't refresh session no user");
			return null
		}
		await db.updateTable("session")
			.set({
				created_at: sql`now()`
			})
			.where("id", "=", session.id)
			.executeTakeFirst()

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
			.executeTakeFirstOrThrow()
		return newSession;
	} catch (err) {
		console.error(err);
		await db.updateTable("session")
			.set({
				created_at: sql` now() - interval '1 hour'`
			})
			.where("id", "=", session.id)
			.executeTakeFirst()
	}
	

}


export async function refreshSubjectsList(session: Session) {
	const subjects = await getSubjectsPage(session);

	if (!subjects.length) {
		return
	}

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
	return subjects

}


export async function refreshUserInfo(session: Session) {
	const { name, surname, faculty, group, recordNumber, course, birthDate } = await getProfilePage(session);
	const facultets = await getFacultets();

	const facultyId = facultets.find(el => el.facultyName === faculty)?.facultyId || 0;

	const groups = await getGroups(facultyId, course);

	const groupId = groups.find(el => el.groupName === group)?.groupId || 0;


	await db.updateTable("user")
		.set({
			name,
			surname,
			faculty,
			group,
			record_number: recordNumber,
			course,
			birth_date: birthDate,
			group_id: groupId,
			faculty_id: facultyId
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
		.selectAll()
		.where("group", "=", user.group)
		.executeTakeFirst()

	if (!schedule?.id) {

		if (!user.group) {
			throw "no user group"
		}
		const scheduleFromApi = await getScheduleByApi(session.user_id)

		await db.insertInto("schedule")
			.values({
				group: user.group,
				data: JSON.stringify(scheduleFromApi)
			})
			.executeTakeFirstOrThrow()
	}

	if (!Object.keys(schedule?.data as any).length) {
		const scheduleFromApi = await getScheduleByApi(session.user_id)
	
		await db.updateTable("schedule")
			.set({
				data: JSON.stringify(scheduleFromApi)
			})
			.where("group", "=", user.group)
			.executeTakeFirstOrThrow()
	}


}

