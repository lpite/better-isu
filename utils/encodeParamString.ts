export default function encodeParamString(paramStr: string) {

	console.log("4e59986b3ff059d05d6cced4df86a2b1%7C%40%7CSTUDYEAR%7C%26%7C2023%7C%7E%7CSEMESTER%7C%26%7C2%7C%7E%7CFACULTY%7C%26%7C%C3%CF%D4")
	return paramStr
		.replaceAll("КІ", "%CA%B2")
		.replaceAll("&", "%26")
		.replaceAll("ФІТ", "%D4%B2%D2")
		.replaceAll("ГПФ", "%C3%CF%D4")
		.replaceAll("ФЕУ", "%D4%C5%D3")
		;
}