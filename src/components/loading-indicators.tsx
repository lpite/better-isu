import { useGroup } from "@/hooks/useGroup";
import { useIndividualPlan } from "@/hooks/useIndividualPlan";
import { useSchedule } from "@/hooks/useSchedule";
import { useSWRConfig } from "swr";

const Keys = {
  profile: "Оновлення інформації про користувача",
  schedule: "Оновлення розкладу",
};
function getNotificationText(key: string) {
  switch (key.split("?")[0]) {
    case "profile":
    case "group":
    case "rating": {
      return "Оновлення інформації про користувача";
      break;
    }
    case "schedule":
    case "individualPlan": {
      return "Оновлення розкладу";
      break;
    }
    case "subjects": {
      return "Оновлення журналів";
      break;
    }
  }
}

export default function LoadingIndicators() {
  // const { isLoading, isValidating } = useSchedule();
  // const { isLoading:isLoadingPlan,isValidating:isValidatingPlan} = useIndividualPlan()
  // const {isLoading:isLoadingGroup,isValidating:isValidatingGroup } = useGroup();
  const { cache } = useSWRConfig();
  const keys = Array.from(cache.keys());
  const loadingStates = keys.map((key) => {
    const state = cache.get(key);
    return {
      key,
      isLoading: state?.isLoading || false,
      isValidating: state?.isValidating || false,
      isEverything: state?.isLoading || state?.isValidating || false,
    };
  });
  const isUpdatingSchedule = loadingStates.filter(
    (el) => el.isEverything,
  ).length;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2">
      {isUpdatingSchedule ? (
        <div className="flex gap-2 mt-2 bg-gray-900 px-4 ">
          <div className="h-1 w-1 border-2 border-blue-600 p-2 rounded-full border-b-transparent animate-spin"></div>
          {
            loadingStates
              .filter((el) => el.isEverything)
              .map((state) => getNotificationText(state.key))[0]
          }
        </div>
      ) : null}
    </div>
  );
}
