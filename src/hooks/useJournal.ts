import { getJournal } from "@/data/getJournal";
import { useAppStore } from "@/stores/useAppStore";
import useSWR from "swr";
import { useProfile } from "./useProfile";
import { useSubjects } from "./useSubjects";

export function useJournal(journalIndex: number) {
	const { session } = useAppStore();
	const { data: profile, isLoading: isLoadingProfile } = useProfile();
  	const { data: subjects } = useSubjects();


	return useSWR(`journal/${journalIndex}`, () =>
		getJournal({
			token: session?.token,
			recordNumber: profile?.recordNumber,
			key: subjects && subjects[journalIndex].link || "",
		}),
	);
}
