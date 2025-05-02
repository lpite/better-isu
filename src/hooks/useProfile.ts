import { getProfilePage } from "@/data/getProfilePage";
import { useAppStore } from "@/stores/useAppStore";
import useSWR from "swr";

export function useProfile() {
  const { session } = useAppStore();
  return useSWR("profile", () => getProfilePage(session?.token || ""), {});
}
