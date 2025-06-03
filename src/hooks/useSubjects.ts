import { getSubjectsPage } from "@/data/getSubjectsPage";
import useSWR from "swr";
import { useSession } from "./useSession";

export function useSubjects() {
  const { session, status } = useSession();

  const canFetchSubjects = status === "authorised" && session?.token;

  return useSWR(
    canFetchSubjects ? "subjects" : null,
    () => getSubjectsPage(session?.token || ""),
    {
      errorRetryCount: 10,
      errorRetryInterval: 500,
    },
  );
}
