import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Schedule {
  data: Json;
  group: string;
  id: Generated<number>;
}

export interface Session {
  created_at: Generated<Timestamp>;
  credentials: Generated<string>;
  id: Generated<number>;
  isu_cookie: string;
  session_id: string;
  user_id: number;
}

export interface SessionUpdateState {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  session: string;
}

export interface SubjectsList {
  created_at: Generated<Timestamp>;
  data: Json;
  id: Generated<number>;
  user_id: number;
}

export interface User {
  birth_date: Generated<string>;
  course: Generated<string>;
  credentials: Generated<string>;
  faculty: Generated<string>;
  faculty_id: Generated<number>;
  group: Generated<string>;
  group_id: Generated<number>;
  id: Generated<number>;
  login: string;
  name: Generated<string>;
  record_number: Generated<string>;
  surname: Generated<string>;
}

export interface DB {
  schedule: Schedule;
  session: Session;
  session_update_state: SessionUpdateState;
  subjects_list: SubjectsList;
  user: User;
}
