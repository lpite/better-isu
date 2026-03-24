/**
 *
 */
export default function encodeParamString(paramStr?: string) {
  // Не буде працювати з іншими факультетами якщо питати розклад не через API

  if (!paramStr) {
    console.error("no paramStr");
    return "";
  }

  return paramStr
    .replaceAll("КІ", "%CA%B2")
    .replaceAll("&", "%26")
    .replaceAll("ФІТ", "%D4%B2%D2")
    .replaceAll("ГПФ", "%C3%CF%D4")
    .replaceAll("ФЕУ", "%D4%C5%D3")
    .replaceAll("^", "%5E")
    .replaceAll("|", "%7C")
    .replaceAll("@", "%40")
    .replaceAll("~", "%7E");
}
