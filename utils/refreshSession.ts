import { Session } from "types/session";
import { decryptText } from "./encryption";
import { db } from "./db";
import { sql } from "kysely";

export default async function refreshSession(session: Session) {
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