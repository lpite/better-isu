import { useEffect, useState } from "react";
import { ClientSession } from "types/session";

export default function useSession() {
	const [session, setSession] = useState<{ error: string | null, data: ClientSession | null }>({ error: null, data: null });
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		setIsLoading(true)
		fetch("/api/session", {
			credentials: "include"
		})
			.then(res => res.json())
			.then((res) => {
				console.log(res)
				setSession(res)
				setIsLoading(false)
			})
			.catch((err) => {
				console.error(err)
				setIsLoading(false)
				setSession({ data: null, error: "idk" })

			})
	}, [])


	return {
		isLoading,
		data: session.data,
		error: session.error
	}
}