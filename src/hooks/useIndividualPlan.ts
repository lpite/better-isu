import getIndividualPlan from "@/data/getIndividualPlan";
import { useAppStore } from "@/stores/useAppStore";
import useSWR from "swr";
import { useProfile } from "./useProfile";
import { useGroup } from "./useGroup";

export function useIndividualPlan() {
  const { session } = useAppStore();

  const { data: profile } = useProfile();
  const { data: group } = useGroup({
    groupName: profile?.group,
    course: profile?.course,
    facultyName: profile?.faculty,
  });

  const canFetch =
    session?.token && profile?.course && group?.currSem?.toString();

  return useSWR(
    canFetch ? "individual-plan" : null,
    () =>
      getIndividualPlan(
        session?.token || "",
        profile?.course || "",
        group.currSem.toString(),
      ),
    {
      revalidateOnFocus: false,
      // revalidateIfStale: false,
    },
  );
}
