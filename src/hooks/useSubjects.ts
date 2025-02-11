import { getSubjectsPage } from "@/data/getSubjectsPage";
import { useAppStore } from "@/stores/useAppStore";
import useSWR from "swr";

export function useSubjects() {
  const { session } = useAppStore();
  return useSWR("subjects", () => getSubjectsPage(session?.token || ""));
}
