import { getSubjectsPage } from "@/data/getSubjectsPage";
import { useAppStore } from "@/stores/useAppStore";
import { laggy } from "@/utils/laggySwr";
import useSWR from "swr";

export function useSubjects() {
  const { session } = useAppStore();
  return useSWR("subjects", () => getSubjectsPage(session?.token || ""), {
    revalidateOnFocus: false,
    use: [laggy],
  });
}
