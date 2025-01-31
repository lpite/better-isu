import { getTypeOfWeek } from "@/data/getTypeOfWeek";
import useSWR from "swr";

export function useTypeOfWeek() {
	return useSWR("typeOfWeek", () => getTypeOfWeek());
}
