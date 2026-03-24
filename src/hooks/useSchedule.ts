import useSWR from "swr";
import { useProfile } from "./useProfile";
import { API_URL } from "@/config";
import { useSession } from "./useSession";

export function useSchedule() {
  const { status } = useSession();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  const canFetchSchedule =
    status !== "loading" &&
    status !== "unauthorised" &&
    !isLoadingProfile &&
    profile?.group &&
    profile?.group &&
    profile?.faculty;

  return useSWR(
    canFetchSchedule
      ? `schedule?groupName=${profile?.group}&course=${profile?.course}&facultyName=${profile?.faculty}`
      : null,
    () =>
      fetch(
        `${API_URL}/api/schedule?groupName=${profile?.group}&course=${profile?.course}&facultyName=${profile?.faculty}`,
      )
        .then((r) => r.json())
        .catch(() => {
          return [];
        }),
    {
      revalidateOnMount: true,
      onError: (err) => {
        console.error(err);
        return [];
      },
    },
  );
}
