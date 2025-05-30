import { getProfilePage } from "@/data/getProfilePage";
import useSWR from "swr";
import { useSession } from "./useSession";

export function useProfile() {
  const { status, session } = useSession();

  return useSWR(
    status === "loading" || status === "unauthorised" ? null : "profile",
    () => getProfilePage(session?.token || ""),
    {},
  );
}
