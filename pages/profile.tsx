import MobileNavigation from "@/components/mobile-navigation"
import { useRouter } from "next/router"
import React from "react"
import { trpc } from "trpc/trpc-client"

export default function ProfilePage() {

	const router = useRouter()

	const {
		data: user,
		isLoading: isLoadingUser
	} = trpc.user.profile.useQuery()

	React.useEffect(() => {
		if (!isLoadingUser && !user) {
			router.push("/login")
		}
	}, [user, router, isLoadingUser])
  
	return (
		<main className="flex items-center flex-col justify-center h-full">
			<span className="text-3xl">{user?.name}</span>
			<span>Номер заліковки {user?.recordNumber}</span>
			<label><input type="checkbox" onChange={() => localStorage.getItem("test_journal") === "true" ? localStorage.setItem("test_journal", "false") : localStorage.setItem("test_journal", "true")} /> Тестовий журнал</label>
			{/* eslint-disable-next-line */}
			<a href="/api/logout" className="border-2 rounded-xl py-2 px-8 my-6 dark:bg-red-600 bg-red-400">Вийти</a>
			<MobileNavigation />
		</main>
	)
}