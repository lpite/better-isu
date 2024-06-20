import parse from "node-html-parser";

export default async function fetchAndDecode(url: string, opts?: RequestInit) {
	const decoder = new TextDecoder("windows-1251");

	const page = await fetch(
		url,
		opts
	)
	
	const decoded = decoder.decode(await page.clone().arrayBuffer());
	const raw = await page.text() 

	return { string: decoded, html: parse(decoded), raw: raw }
}