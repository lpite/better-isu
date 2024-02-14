import MobileNavigation from "@/components/mobile-navigation"
import { useRouter } from "next/router"
import React, { use } from "react"
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
		<main className="flex items-center justify-center h-full">
			<h1 >Hi {user?.name2}!</h1>
			<MobileNavigation />
		</main>
	)
}