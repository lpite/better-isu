import useSWR from "swr";
import { useProfile } from "./useProfile";

export function useSchedule() {
  const { data: profile } = useProfile();

  return useSWR(
    `schedule?groupName=${profile?.group}&course=${profile?.course}&facultyName=${profile?.faculty}`,
    () =>
      fetch(
        `/api/schedule?groupName=${profile?.group}&course=${profile?.course}&facultyName=${profile?.faculty}`,
      )
        .then((r) => r.json())
        .catch(() => {
          return [];
        }),
    {
      revalidateIfStale: true,
      revalidateOnFocus: true,
      // revalidateOnMount: false,
      onError: () => {},
    },
  );
}
