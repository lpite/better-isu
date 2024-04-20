export default async function getFacultets() {
	const formDataWithKey = new FormData();
	formDataWithKey.append("schedAppKey", process.env.ISU_API_KEY || "");

	const facultets = await fetch("https://isu1.khmnu.edu.ua/isu/pub/api/v1/getFaculties.php", {
		method: "POST",
		body: formDataWithKey
			
	})
		.then(res => res.json())
		.catch(_ => []) as { facultyId: number, facultyName: string, facultyShortName: string }[]

	return facultets
}