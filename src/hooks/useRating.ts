import { getRatingPage } from "@/data/getRatingPage";
import { useAppStore } from "@/stores/useAppStore";
import { laggy } from "@/utils/laggySwr";
import useSWR from "swr";

export function useRating() {
  const { session } = useAppStore();

  return useSWR("rating", () => getRatingPage(session?.token || ""), {
    onError: (err) => {
      console.error(err);
    },
    use: [laggy],
  });
}
