export default async function getGroups(facultyId: number, course: string) {
  const formDataWithKey = new FormData();
  formDataWithKey.append("schedAppKey", process.env.ISU_API_KEY || "");

  formDataWithKey.append("course", course);
  formDataWithKey.append("facultyId", facultyId.toString());

  const groups = (await fetch(
    "https://isu1.khmnu.edu.ua/isu/pub/api/v1/getGroups.php",
    {
      method: "POST",
      body: formDataWithKey,
    },
  )
    .then((res) => res.json())
    .catch((_) => [])) as {
    groupId: number;
    groupName: string;
    studYear: number;
    currSem: number;
  }[];

  return groups;
}

export async function getGroup(
  groupId: number,
  facultyId: number,
  course: string,
) {
  const groups = await getGroups(facultyId, course);

  const group = groups.find((gr) => gr.groupId === groupId);

  if (!group) {
    const groups = await getGroups(
      facultyId,
      (parseInt(course) - 1).toString(),
    );
    const group = groups.find((el) => el.groupId === groupId);
    return group;
  }

  return group;
}
