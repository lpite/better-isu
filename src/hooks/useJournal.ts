import { getJournal } from "@/data/getJournal";
import { useAppStore } from "@/stores/useAppStore";
import useSWR from "swr";
import { useProfile } from "./useProfile";
import { useSubjects } from "./useSubjects";
import { useSession } from "./useSession";

export function useJournal(journalIndex: number) {
  const { session, status } = useSession();

  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: subjects, isLoading: isLoadingSubjects } = useSubjects();

  const canFetchJournal =
    status !== "loading" &&
    status !== "unauthorised" &&
    !isLoadingProfile &&
    !isLoadingSubjects;

  return useSWR(canFetchJournal ? `journal/${journalIndex}` : null, () =>
    getJournal({
      token: session?.token,
      recordNumber: profile?.recordNumber,
      key: (subjects && subjects[journalIndex].link) || "",
      journalName: (subjects && subjects[journalIndex].name) || "",
    }),
  );
}
