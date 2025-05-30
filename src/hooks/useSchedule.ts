import useSWR from "swr";
import { useProfile } from "./useProfile";
import { laggy } from "@/utils/laggySwr";
import { API_URL } from "@/config";
import { useSession } from "./useSession";

export function useSchedule() {
  const { status } = useSession();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  // if (status === "loading") {
  //   return {
  //     data: undefined,
  //     error: undefined,
  //     isLoading: true,
  //     isValidating: false,
  //   };
  // }

  const canFetchSchedule =
    status !== "loading" && status !== "unauthorised" && !isLoadingProfile;

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
      revalidateIfStale: true,
      revalidateOnFocus: true,
      revalidateOnMount: true,
      onError: (err) => {
        console.error(err);
        return [];
      },
    },
  );
}
