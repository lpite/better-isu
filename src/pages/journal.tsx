import BottomNavigation from "@/components/bottom-navigation";
import HeaderWithLabel from "@/components/header-with-label";

export default function JournalPage() {
	return <>
		<HeaderWithLabel pageName="Тестовий журнал" />
		<main className="px-4">
			<h1>Назва журналу</h1>
			<div className="flex gap-2">
				{Array(3).fill(0).map(() => (
					<label className="border border-blue-50 py-2.5 px-6 block rounded-lg">
						KR
						<input className="sr-only" type="radio" />
					</label>
				))}
			</div>
		</main>
      <BottomNavigation />
		
	</>
}