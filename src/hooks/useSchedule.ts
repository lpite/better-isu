import useSWR from "swr";
import { useProfile } from "./useProfile";
import { laggy } from "@/utils/laggySwr";

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
      revalidateOnMount: true,
      onError: () => {},
      use: [laggy],
    },
  );
}
