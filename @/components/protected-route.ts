import { useRouter } from "next/router";
import { useGetAuthSession } from "orval/default/default";
import { useEffect } from "react";

export default function ProtectedRoute() {
	const router = useRouter();

	const {
		data: session,
		error,
		isLoading,
		isValidating
	} = useGetAuthSession({
		swr: {
			revalidateOnMount: true,
			revalidateIfStale: true,
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
			fallbackData: {
				data: {
					created_at: "",
					session_id: "1"
				}
			}
		}
	});

	useEffect(() => {
		console.log(session, error)
		if (!isLoading && !isValidating && !session?.data) {
			console.log("PUSH login 1 ", session, error, isLoading, isValidating)
			router.push("/login")
		}
		if (!isLoading && !isValidating && error) {
			console.log("PUSH login 2 ", session, error, isLoading, isValidating)
			router.push("/login")
		}
	}, [session, error, isLoading, isValidating])

	return null;
}