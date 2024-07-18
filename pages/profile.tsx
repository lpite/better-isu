import MobileNavigation from "@/components/mobile-navigation";
import { useRouter } from "next/router";
import React from "react";
import zod from "zod";
import {
  useGetAuthSession,
  useGetUserProfile,
  usePostAuthLogout,
} from "orval/default/default";
import Link from "next/link";
import ProtectedRoute from "@/components/protected-route";
const journalTypeSchema = zod.enum(["default", "new"]);

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser } = useGetUserProfile();

  const { mutate: mutateSession } = useGetAuthSession();

  const [journalType, setJournalType] = React.useState<"default" | "new">(
    "default",
  );

  const { trigger: logoutTrigger } = usePostAuthLogout();

  React.useEffect(() => {
    const journalType = journalTypeSchema.parse(
      localStorage.getItem("journalType") || "default",
    );

    setJournalType(journalType);
  }, []);

  function changeJournalType(type: zod.output<typeof journalTypeSchema>) {
    localStorage.setItem("journalType", type);
    setJournalType(type);
  }

  async function logout() {
    await logoutTrigger();
    mutateSession();
    router.push("/login");
  }

  return (
    <main className="flex items-center flex-col justify-center h-full pb-14 px-2">
      <ProtectedRoute />
      <div className="flex flex-col justify-center items-center grow w-full pt-24">
        <span className="text-2xl">
          {user?.name} {user?.surname}
        </span>
        <span>Номер заліковки {user?.recordNumber}</span>
        <div className="w-full my-2">
          <Link href="/rating">
            <a className="block w-full p-2 bg-slate-800 rounded-lg">Рейтинг</a>
          </Link>
        </div>
        <span className="mt-4 mb-2">Вигляд журналу</span>
        <form className="flex gap-4 w-full px-6">
          <label
            className={`flex justify-center p-4 border-2 rounded-xl w-1/2 ${journalType === "default" ? "border-blue-900" : ""}`}
          >
            <input
              type="radio"
              name="journal_type"
              className="appearance-none w-0 h-0 absolute"
              onChange={() => changeJournalType("default")}
            />
            Стандартний
          </label>
          <label
            className={`flex justify-center p-4 border-2 rounded-xl w-1/2 ${journalType === "new" ? "border-blue-900" : ""}`}
          >
            <input
              type="radio"
              name="journal_type"
              className="appearance-none w-0 h-0 absolute"
              onChange={() => changeJournalType("new")}
            />
            Тестовий
          </label>
        </form>
      </div>
      <button
        onClick={logout}
        className="border-2 rounded-xl py-2 px-8 my-6 dark:bg-red-600 bg-red-400"
      >
        Вийти
      </button>
      <MobileNavigation />
    </main>
  );
}
