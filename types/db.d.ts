import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Session {
  created_at: Generated<Timestamp>;
  id: Generated<number>;
  isu_cookie: string;
  session_id: string;
  user_id: number;
}

export interface User {
  credentials: Generated<string>;
  id: Generated<number>;
  login: string;
}

export interface DB {
  session: Session;
  user: User;
}
