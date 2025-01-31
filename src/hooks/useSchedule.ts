import useSWR from "swr";
import { useProfile } from "./useProfile";

export function useSchedule() {
	// const { session } = useAppStore();
	const { data: profile } = useProfile();

	return useSWR(
		`schedule?groupName=${profile?.group}&course=${profile?.course}&facultyName=${profile?.faculty}`,
		() =>
			fetch(`/api/schedule?groupName=${profile?.group}&course=${profile?.course}&facultyName=${profile?.faculty}`)
				.then((r) => r.json())
				.catch(() => {
					return { schedule: [] };
				}),
		{
			revalidateIfStale: true,
			revalidateOnFocus: false,
			// revalidateOnMount: false,
			onError: () => {},
		},
	);
}
