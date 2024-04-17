import parse from "node-html-parser";

export default async function fetchAndDecode(url: string, opts: RequestInit) {
	const decoder = new TextDecoder("windows-1251");
	parse
	const page = await fetch(
		url,
		opts
	)
		.then((res) => res.arrayBuffer())
		.then((res) => decoder.decode(res))
		.catch((res) => {
			return ""
		})

	return { string: page, html: parse(page) }
	// https://isu1.khmnu.edu.ua/isu/dbsupport/students/personnel.php
}