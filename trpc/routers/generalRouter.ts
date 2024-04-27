import parse from "node-html-parser";
import { procedure, router } from "trpc/trpc";

export const generalRouter = router({
	typeOfWeek: procedure.query(async ({ ctx: { res } }) => {
		
		res.setHeader("Cache-Control","max-age=14400")

		const decoder = new TextDecoder("windows-1251");
		
		const page = await fetch("https://isu1.khmnu.edu.ua/isu/")
			.then(res => res.arrayBuffer())
			.then((res) => decoder.decode(res))
 
		const html = parse(page);

		const typeOfWeek = html.querySelector(".logo-time")?.textContent.split(".")[1].trim()

		if (typeOfWeek === "Знаменник") {
			return "bottom"
		}
		return "up"

	})
})