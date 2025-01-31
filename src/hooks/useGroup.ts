import useSWR from "swr";

type UseGroup = {
	groupName?: string;
	course?: string;
	facultyName?: string;
};

export function useGroup({ groupName, course, facultyName }: UseGroup) {
	return useSWR(
		groupName && course && facultyName ? "group" : null,
		() =>
			fetch(
				`/api/group?groupName=${groupName}&course=${course}&facultyName=${facultyName}`,
			).then((r) => r.json()),
		{
			revalidateOnFocus: false,
		},
	);
}
