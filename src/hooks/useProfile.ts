import { getProfilePage } from "@/data/getProfilePage";
import { useAppStore } from "@/stores/useAppStore";
import { laggy } from "@/utils/laggySwr";
import useSWR from "swr";

export function useProfile() {
  const { session } = useAppStore();
  return useSWR("profile", () => getProfilePage(session?.token || ""), {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    use: [laggy],
  });
}
