
type Day = { RECORDBOOK: string, MONTHSTR: string, DAYNUM: string, CONTROLSHORTNAME: string, GRADE: string, LFP: string }

type GetGradesParams = {
	isu_cookie?: string,
	journalId: string,
	groupId: number,
	recordNumber: string
}

export default async function getGradesForUser({
	isu_cookie, groupId, journalId, recordNumber
}: GetGradesParams): Promise<Day[]> {
	const grades = await fetch("https://isu1.khmnu.edu.ua/isu/dbsupport/students/jrn/jrngrades.php", {
		headers: {
			"Cookie": `PHPSESSID=${isu_cookie}`,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		method: "POST",
		body: `grp=${groupId}&jrn=${journalId}&page=1&start=0&limit=25`
	})
		.then(res => res.json())
		.catch((err) => {
			console.error(err);
			return []
		}) 
	return grades.filter((el: Day) => el.RECORDBOOK.trim() === recordNumber)
}