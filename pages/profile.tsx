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
import PageHeader from "@/components/page-header";
import { useTheme } from "next-themes";
const journalTypeSchema = zod.enum(["default", "new"]);
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import NoSsr from "@/components/no-ssr";

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading: isLoadingUser } = useGetUserProfile();

  const { mutate: mutateSession } = useGetAuthSession();

  const [journalType, setJournalType] = React.useState<"default" | "new">(
    "default",
  );

  const { trigger: logoutTrigger } = usePostAuthLogout();

  const { theme, setTheme } = useTheme();

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
  console.log(theme);
  return (
    <>
      <PageHeader name="Профіль" />
      <ProtectedRoute />
      <main className="flex items-center flex-col justify-center h-10/12 pb-14 px-2">
        <div className="flex flex-col justify-center items-start grow w-full pt-3">
          <span className="text-3xl pb-6">
            {user?.name} {user?.surname}
          </span>
          <span>Номер заліковки {user?.recordNumber}</span>
          <span>{user?.faculty}</span>
          <span>Спеціальність {user?.speciality}</span>
          <span>Група {user?.group}</span>
          <span>Курс {user?.course}</span>

          <div className="w-full my-6">
            <Link href="/rating">
              <a className="block w-full p-2 dark:bg-slate-800 bg-slate-300 rounded-lg">
                Рейтинг
              </a>
            </Link>
          </div>
          <span className="mt-4 mb-2 text-2xl font-medium">
            Зовнішній вигляд
          </span>
          <form className="flex flex-col gap-2 w-full px-2 а">
            <Label className="flex items-center gap-2 w-full my-5">
              <div className="w-full">
                <span className="text-lg w-full block mb-2">
                  Використовувати системну тему
                </span>
                <span className="font-normal text-slate-600">
                  Зовнішній вигляд буде автоматично змінюватися при зміні теми
                  на пристрої
                </span>
              </div>
              <NoSsr>
                {/* Вимкнення ssr потрібне для того щоб воно показувало правильну тему*/}
                <Switch
                  checked={theme === "system"}
                  onCheckedChange={() =>
                    theme === "system" ? setTheme("light") : setTheme("system")
                  }
                />
              </NoSsr>
            </Label>
            <div className="w-full flex gap-2">
              <NoSsr>
                <label
                  className={`flex justify-center p-4 border-2 rounded-xl w-1/2 ${theme === "light" ? "border-blue-900" : ""}`}
                >
                  <input
                    type="radio"
                    name="journal_type"
                    className="appearance-none w-0 h-0 absolute"
                    onChange={() => setTheme("light")}
                  />
                  Світла
                </label>
              </NoSsr>
              <NoSsr>
                <label
                  className={`flex justify-center p-4 border-2 rounded-xl w-1/2 ${theme === "dark" ? "border-blue-900" : ""}`}
                >
                  <input
                    type="radio"
                    name="journal_type"
                    className="appearance-none w-0 h-0 absolute"
                    onChange={() => setTheme("dark")}
                  />
                  Темна
                </label>
              </NoSsr>
            </div>
            <Label className="flex items-center gap-2 w-full my-5">
              <div className="w-full">
                <span className="text-lg w-full block mb-2">
                  Тестовий вигляд журналу
                </span>
                <span className="font-normal text-slate-600">
                  Сторінка журналу буде замінена на тестовий варіант
                </span>
              </div>
              <NoSsr>
                {/* Вимкнення ssr потрібне для того щоб воно показувало правильну тему*/}
                <Switch
                  checked={journalType === "new"}
                  onCheckedChange={() =>
                    journalType === "new"
                      ? changeJournalType("default")
                      : changeJournalType("new")
                  }
                />
              </NoSsr>
            </Label>
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
    </>
  );
}
