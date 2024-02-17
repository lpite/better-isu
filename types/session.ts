import { Selectable } from "kysely";
import { DB } from "./db";

export type Session = Omit<Selectable<DB["session"]>, "isu_cookie"> & {
	isu_cookie?: string
}


//Для клієнта не повертаю куку університету
export type ClientSession = Omit<Session, "isu_cookie">;