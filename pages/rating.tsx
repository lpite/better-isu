import PageBackButton from "@/components/page-back-button";
import PageHeader from "@/components/page-header";
import ProtectedRoute from "@/components/protected-route";
import { useGetUserRating } from "orval/default/default";



export default function RaitingPage() {
	const {
		data: rating,
		isLoading
	} = useGetUserRating()

	if (isLoading) {
		return (
			<>
				<ProtectedRoute />
				<PageHeader name="" />
				<main className="h-full flex items-center justify-center">
					<div className="flex w-full h-64 items-center justify-center">
						<div className="border-2 border-blue-600 p-4 rounded-full border-b-transparent animate-spin"></div>
					</div>
				</main>
			</>)
	}

	return (
		<>
			<ProtectedRoute />
			<PageHeader name="Рейтинг" />
			<main className="gap-1 p-2 pt-3 pb-14">
				{rating?.map((row, i) => (
					<div className={`flex p-2  ${(i % 2) ? "bg-slate-700" : ""}`} key={row.surname + row.name + row.rating}>
						<span className="w-10 inline-block">
							{row.number}
						</span>
						<span className="w-full inline-block">
							{row.surname} 
							{" "}
							{row.name}
						</span>
						{row.rating}

					</div>
				))}
				<PageBackButton backButtonLink="/profile" />
			</main>
		</>
	)
}