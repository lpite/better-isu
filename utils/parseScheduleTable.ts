import { parse, HTMLElement } from "node-html-parser"


// НАЙГІРШИЙ КОД ЗА ВСЮ ІСТОРІЮ МОГО ІСНУВАННЯ 
// so far.......

export function parseScheduleTable(htmlText: string) {
	const html = parse(htmlText);

	const table = html.querySelector("table")


	const days = ["Пн", "Вт", "Ср", "Чт", "Пт"]

	let cells = table?.querySelectorAll("td")
		.filter(el => !el.classList.contains("dates"))
		.filter(el => !el.classList.contains("pairS"))
		.flatMap((el, i) => {
			if (el.querySelector("table")) {

				// if(cells[i])

				const innerCells = el.querySelectorAll("td");
				if (innerCells) {
					// console.log("OH YEAH KILL ME PLEASE")
					// console.log(innerCells.map((el)=>el.textContent))
					// innerCells[0].setAttribute("cols", innerCells.length.toString());
					return innerCells.map((el) => {
						return el.setAttribute("cols", innerCells.length.toString())
					});
				}
			}
			return el
		});
	if (!cells) {
		return {}
	}
	// console.log(cells?.length)



	if (!cells) {
		throw "Табличка пуста чомусь"
	}

	const subjArray: any[] = []

	let subj: any = {}

	let rowLength = 0;

	let firstDay = true;

	let currentNumber = ""
	let currentDay = days[0];

	for (let i = 0; i < cells?.length; i++) {
		const el = cells[i];
		
		
		if (el.getAttribute("style")?.includes("height:1px;") && i !== cells.length - 1) {
			currentDay = days[days.indexOf(currentDay) + 1];
			continue;
		}
		subj["day"] = currentDay
		rowLength++;

		if (i === cells.length - 1) {
			rowLength++;
		}

		if (days.indexOf(el.textContent.trim()) !== -1 || i === cells.length - 1) {
			// console.log(i)
			if (i === cells.length - 1) {
			}
			// console.log(rowLength)

			subj["number"] = currentNumber

			if (rowLength === 3) {

				if (cells[i - 1].getAttribute("style")?.includes("height")) {
					subj["name"] = cells[i - 2].textContent
					subj["day"] = days[days.indexOf(subj["day"]) - 1]

				} else {
					subj["name"] = cells[i - 1].textContent
				
				}
				subj["type"] = "full";

			}

			if (rowLength === 4) {
		
				const upperPair = cells[i - 2].textContent.replaceAll(/\t|\n/gi, "").trim();
				const bottomPair = cells[i - 1].textContent.replaceAll(/\t|\n/gi, "").trim();
				if (upperPair.length && !bottomPair.length) {
					subj["type"] = "up";
					subj["name"] = upperPair;
				}

				if (!upperPair.length && bottomPair.length) {
					subj["type"] = "bottom";
					subj["name"] = bottomPair;
				}

				if (upperPair.length && bottomPair.length) {
					subjArray.push({
						day: subj["day"],
						number: subj["number"],
						name: upperPair,
						type: "up"
					})
					subjArray.push({
						day: subj["day"],
						number: subj["number"],
						name: bottomPair,
						type: "bottom"
					})

				}

			}
			if (subj["day"] === "Пт") {
				// console.log(cells[i - 6].textContent.replaceAll(/\t|\n/gi, "").trim())
				// console.log(rowLength)
				if (cells[i - 6].textContent.replaceAll(/\t|\n/gi, "").trim().includes("1-210")) {
					// console.log("fucK", subj)
					// console.log({
					// 	day: subj["day"],
					// 	number: subj["number"],
					// 	name: el.textContent,
					// 	type: "full"
					// })
				}
			}
			// if (el.textContent.replaceAll(/\t|\n/gi, "").trim().includes("1-210")) {
			// 	console.log("fucK", subj)
			// 	console.log({
			// 		day: subj["day"],
			// 		number: subj["number"],
			// 		name: el.textContent,
			// 		type: "full"
			// 	})
			// }

			if (rowLength > 5) {

				let idk = 2;
				if (cells[i - 1].getAttribute("style")?.includes("height")) {
					subj["day"] = cells[i - rowLength - 1]?.textContent.trim()
					// console.log(rowLength)
					rowLength -= 1;
					idk = 0;
					// console.log("i changedsmth")
					// console.log(rowLength)

				}

				if (cells[i].getAttribute("style")?.includes("height")) {
					rowLength--;
				
				}
				if (subj["day"] === "Пт") {
					// console.log(rowLength)
					if (cells[i - 6].textContent.replaceAll(/\t|\n/gi, "").trim().includes("1-210")) {
						// console.log("fucK", subj)
						// console.log({
						// 	day: subj["day"],
						// 	number: subj["number"],
						// 	name: el.textContent,
						// 	type: "full"
						// })
					}
				}

				const newArray = cells.slice(i - rowLength + idk, i);
				console.log(cells.slice(i - rowLength + idk, i).map(el => el.textContent))
				newArray.forEach((el, ind) => {
					const text = el.textContent.replaceAll(/\t|\n/gi, "").trim()
					
					
					
					if (text.length) {

						if (el.getAttribute("cols")) {
							// Якщо там оцей innerTab то у клітинок немає роу спана
							// console.log((rowLength - 2 - ind) / Number(el.getAttribute("cols")))
							const isItOnTopOrBottom = (rowLength - 2 - ind) / Number(el.getAttribute("cols"));

							if (isItOnTopOrBottom % 2 === 0) {
								subjArray.push({
									day: subj["day"],
									number: subj["number"],
									name: text,
									type: "up"
								})
							} else {
								subjArray.push({
									day: subj["day"],
									number: subj["number"],
									name: text,
									type: "bottom"
								})
							}
							
						}

						if (Number(el.getAttribute("rowspan")) >= 2) {

							subjArray.push({
								day: subj["day"],
								number: subj["number"],
								name: text,
								type: "full"
							})
						}
						if (el.getAttribute("style")?.includes("border-bottom-color")) {
							subjArray.push({
								day: subj["day"],
								number: subj["number"],
								name: text,
								type: "up"
							})
						}
						if (el.getAttribute("rowspan") === "1" && !el.getAttribute("style")?.includes("border-bottom-color")) {
							subjArray.push({
								day: subj["day"],
								number: subj["number"],
								name: text,
								type: "up"
							})
						}
						
					}
				})
			}


			rowLength = 0;
		

			if (!firstDay) {
				if (subj.name) {
					subjArray.push(subj)
				} else {
					// console.log(cells[i - 6].textContent)
					// console.log(subj)
				}
				subj = {}
			}
			firstDay = false;
			currentNumber = cells[i + 1]?.textContent

		}

	}

	console.log(subjArray)
	return subjArray
}


export function altParse(htmlText: string) {
	const html = parse(htmlText);

	const table = html.querySelector("table")


	const days = ["Пн", "Вт", "Ср", "Чт", "Пт"]

	let cells = table?.querySelectorAll("td")
		.filter(el => !el.classList.contains("dates"))
		.filter(el => !el.classList.contains("pairS"))
		.flatMap((el, i) => {
			if (el.querySelector("table")) {

				const innerCells = el.querySelectorAll("td");
				if (innerCells) {
					// console.log("OH YEAH KILL ME PLEASE")
					// console.log(innerCells.map((el)=>el.textContent))
					// innerCells[0].setAttribute("cols", innerCells.length.toString());
					return innerCells.map((el) => {
						return el.setAttribute("cols", innerCells.length.toString())
					});
				}
			}
			return el
		});

	if (!cells) {
		return []
	}
	for (let i = 0; i < cells?.length; i++) {
		const cell = cells[i];

	}
}


