import { getSubjectsPage } from "@/data/getSubjectsPage";
import useSWR from "swr";
import { useSession } from "./useSession";

export function useSubjects() {
  const { session, status } = useSession();

  const isSessionReady = status !== "loading" && status !== "refreshing";

  return useSWR(
    isSessionReady && status !== "unauthorised"
      ? ["subjects", session?.token]
      : null,
    () => getSubjectsPage(session?.token),
    {
      errorRetryCount: 10,
      errorRetryInterval: 500,
    },
  );
}
