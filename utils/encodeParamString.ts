/**
 * @deprecated не буде працювати з іншмим факультетами
 */
export default function encodeParamString(paramStr: string) {
	// Не буде працювати з іншими факультетами
	// потрібна тільки для запитів розкладу

	return paramStr
		.replaceAll("КІ", "%CA%B2")
		.replaceAll("&", "%26")
		.replaceAll("ФІТ", "%D4%B2%D2")
		.replaceAll("ГПФ", "%C3%CF%D4")
		.replaceAll("ФЕУ", "%D4%C5%D3")
		;
}