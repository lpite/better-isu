import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface Store {
  user?: {
    login: string;
    password: string;
  };
  session?: {
    token: string;
    created_at: Date;
  };
  // profile?: {
  // 	name: string;
  // };
  subjects?: [];
  // individualPlan?: [];
  // schedule?: {
  // 	schedule: [];
  // };
}

export const useAppStore = create<Store>()(
  persist(
    devtools(() => ({
      user: undefined,
      session: undefined,
    })),
    {
      name: "app-store",
      version: 1,
    },
  ),
);
