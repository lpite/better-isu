import { useGetGeneralStats } from "orval/default/default";

export default function StatsPage() {
	const { data: stats } = useGetGeneralStats();
	return (
		<main>
			<h2>Всього користувачів {stats?.users}</h2>
			<h2>Користувачів з сьогодні {stats?.sessionsToday}</h2>
		</main>
	);
}
