import { Selectable } from "kysely";
import { DB } from "./db";

export type Session = Selectable<DB["session"]>