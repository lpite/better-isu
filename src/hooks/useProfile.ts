import { getProfilePage } from "@/data/getProfilePage";
import useSWR from "swr";
import { useSession } from "./useSession";

export function useProfile() {
  const { status, session } = useSession();

  const isSessionReady = status !== "loading" && status !== "refreshing";

  const profile = useSWR(
    isSessionReady && status !== "unauthorised" ? "profile" : null,
    () => getProfilePage(session?.token || ""),
  );

  return { ...profile, isLoading: profile.isLoading || !isSessionReady };
}
