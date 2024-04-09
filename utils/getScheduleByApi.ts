import { db } from "./db"

type ScheduleItem = {
	streamId: number;
	numYear: number;
	numSemester: number;
	subGroup: string;
	studyTypeId: number;
	studyTypeShortName?: null;
	subjectId: number;
	subjectName: string;
	subjectABBR: string;
	teacherPhoto: string;
	teacherFullName: string;
	teacherShortName: string;
	dateFrom: string;
	dateTo: string;
	weeklyLoad: string;
	weekId: 0 | 1 | 2;
	weekName?: null | "Чис. ";
	dayOfWeek: number;
	dayName: string;
	pairNum: number;
	audName: string;
	groupId: number;
	groupName: string;
	isSubGroup: string;

}

export default async function getScheduleByApi(user_id: number) {
	const user = await db.selectFrom("user")
		.select(["group", "faculty", "course"])
		.where("user.id", "=", user_id)
		.executeTakeFirstOrThrow();

	
	const formDataWithKey = new FormData();
	formDataWithKey.append("schedAppKey", process.env.ISU_API_KEY || "");

	// TODO: замість о цього всього просто зберігати в бд
	// айді факультету та айді групи
	const { facultyId, group } = await getUserInfo(user)

	let studYear = (new Date()).getFullYear();
	let currentSemester = "1";

	if (group.currSem % 2 === 0) {
		studYear--;
		currentSemester = "2"
	}

	formDataWithKey.append("groupId", group.groupId.toString())
	formDataWithKey.append("studyYear", studYear.toString())
	formDataWithKey.append("semester", currentSemester)



	const schedule = await fetch("https://isu1.khmnu.edu.ua/isu/pub/api/v1/getScheduleForGroup.php", {
		method: "POST",
		body: formDataWithKey
	}).then(res => res.json())
		.catch(_ => []) as ScheduleItem[]



	const pairTypes = ["full", "up", "bottom"]
	const studyTypes = ["", "пр.", "лекц.", "лаб."]

	return schedule.map((el) => {
		return {
			day: el.dayName,
			number: el.dayOfWeek,
			type: pairTypes[el.weekId],
			name: `${studyTypes[el.studyTypeId]} ${el.subjectName} ${el.audName} ${el.teacherShortName}`

		}
	})


}


async function getUserInfo(user: { group: string, faculty: string, course: string }) {
	// тимчасова функція
	const formDataWithKey = new FormData();
	formDataWithKey.append("schedAppKey", process.env.ISU_API_KEY || "");

	const facultets = await fetch("https://isu1.khmnu.edu.ua/isu/pub/api/v1/getFaculties.php", {
		method: "POST",
		body: formDataWithKey
			
	})
		.then(res => res.json())
		.catch(_ => []) as { facultyId: number, facultyName: string, facultyShortName: string }[]

	if (!facultets?.length) {
		throw "no facultets";
	}

	const facultyId = facultets.find(el => el.facultyName === user.faculty)?.facultyId;

	if (!facultyId) {
		throw "can't find facultyId";
	}

	formDataWithKey.append("course", user.course);
	formDataWithKey.append("facultyId", facultyId.toString());

	const groups = await fetch("https://isu1.khmnu.edu.ua/isu/pub/api/v1/getGroups.php", {
		method: "POST",
		body: formDataWithKey
			
	})
		.then(res => res.json())
		.catch(_ => []) as { groupId: number, groupName: string, studYear: number, currSem: number }[]

	if (!groups?.length) {
		throw "no groups";
	}

	const group = groups.find(el => el.groupName === user.group);

	if (!group) {
		throw "can't find groupId";
	}

	return { group, facultyId }


}