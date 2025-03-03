import loginPageParser from "@/data/loginPageParser";
import { useAppStore } from "@/stores/useAppStore";
import { useEffect } from "react";

export function useSession() {
	const { session, user } = useAppStore();
	useEffect(() => {
		const now = new Date();
		if (!session || !user) {
			return;
		}
		if (typeof session?.created_at === "string") {
			// коли береться кеш з локал стораджа то він дату в строку робить
			// а мені в падло це фіксить
			const date = new Date(session?.created_at);
			//@ts-expect-error так треба
			if (now - date > 3600000) {
				console.log("passed")
				updateSession(user?.login, user?.password).catch((err) => {
					console.error(err)
				})
			} else {
				console.log("meow")
			
			}
		} else {
			//@ts-expect-error так треба
			if (now - session?.created_at > 3600000) {
				console.log("passed")
				updateSession(user?.login, user?.password).catch((err) => {
					console.error(err)
				})
			} else {
				console.log("meow")
			}
		}
	}, [session])
}


async function updateSession(login: string, password: string) {
	const res = await fetch(
		"/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/logon.php",
		{
			method: "POST",
			body: `login=${login}&passwd=${password}&btnSubmit=%D3%E2%B3%E9%F2%E8`,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		},
	);

	const result = await loginPageParser(res);

	const cookie = document.cookie
		.split(";")
		.find((el) => el.startsWith("isu_cookie"))
		?.replace("isu_cookie=", "");

	if (result.success && cookie) {
		useAppStore.setState((state) => ({
			...state,
			session: {
				token: cookie.toString(),
				created_at: new Date(),
			}
		}));
	}
}