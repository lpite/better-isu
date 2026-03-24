import { API_URL } from "@/config";
import { laggy } from "@/utils/laggySwr";
import useSWR from "swr";

type UseGroup = {
  groupName?: string;
  course?: string;
  facultyName?: string;
};

export function useGroup({ groupName, course, facultyName }: UseGroup) {
  return useSWR(
    groupName && course && facultyName ? "group" : null,
    () =>
      fetch(
        `${API_URL}/api/group?groupName=${groupName}&course=${course}&facultyName=${facultyName}`,
      ).then((r) => r.json()),
    {
      revalidateOnFocus: false,
      use: [laggy],
    },
  );
}
