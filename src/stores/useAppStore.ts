import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface Session {
  token: string;
  created_at: number;
  status?: "loading" | "unauthorised" | "authorised";
}

interface Store {
  user?: {
    login: string;
    password: string;
  };
  session: Session | null;
  subjects?: [];
  setSessionStatus: (status: Session["status"]) => void;
}

export const useAppStore = create<Store>()(
  persist(
    devtools((set) => ({
      user: undefined,
      session: undefined,
      setSessionStatus: (status) =>
        set((s) => ({
          ...s,
          session: {
            ...(s.session as any),
            status,
          },
        })),
    })),
    {
      name: "app-store",
      version: 2,
    },
  ),
);
