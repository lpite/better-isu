import HeaderWithLabel from "@/components/header-with-label";

import { Switch } from "@/components/ui/switch";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";

export default function AppearancePage() {
  const { setTheme, theme } = useTheme();
  const [testJournal, setTestJournal] = useState(false);

  useEffect(() => {
    setTestJournal(Boolean(localStorage.getItem("test_journal")));
  }, []);

  function toggleTestJournal() {
    if (testJournal) {
      localStorage.removeItem("test_journal");
      setTestJournal(false);
    } else {
      localStorage.setItem("test_journal", "true");
      setTestJournal(true);
    }
  }

  return (
    <>
      <HeaderWithLabel pageName="Зовнішній вигляд" />
      <main className="pt-8 px-4">
        <label className="flex">
          <div className="flex flex-col">
            <span className="font-medium">Використовувати системну тему</span>
            <span className="text-xs w-4/5">
              Зовнішній вигляд буде автоматично змінюватися при зміні теми на
              пристрої
            </span>
          </div>
          <Switch
            checked={theme === "system"}
            onCheckedChange={() =>
              setTheme(theme === "system" ? "light" : "system")
            }
          />
        </label>
        <div className="flex gap-4 mt-5">
          <ColorThemeToggle
            toggled={theme === "light"}
            onToggle={() => setTheme("light")}
            activeClass="text-blue-900 bg-blue-50"
          >
            <SunIcon width={24} />
            <span>Світла</span>
          </ColorThemeToggle>
          <ColorThemeToggle
            toggled={theme === "dark"}
            onToggle={() => setTheme("dark")}
            activeClass="bg-blue-900 dark:bg-blue-600 text-blue-50"
          >
            <MoonIcon width={24} />
            <span>Темна</span>
          </ColorThemeToggle>
        </div>
        <label className="flex mt-5">
          <div className="flex flex-col">
            <span className="font-medium">Тестовий вигляд журналу</span>
            <span className="text-xs w-4/5">
              Сторінка журналу з оцінками буде замінена на тестовий варіант
            </span>
          </div>
          <Switch checked={testJournal} onCheckedChange={toggleTestJournal} />
        </label>
      </main>
    </>
  );
}

type ColorThemeToggleProps = {
  activeClass: string;
  toggled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

function ColorThemeToggle({
  activeClass,
  toggled,
  onToggle,
  children,
}: ColorThemeToggleProps) {
  return (
    <label
      className={`flex items-center justify-center gap-1 rounded-lg h-10 w-full border border-slate-300  ${toggled ? activeClass + " border-transparent" : "dark:border-slate-600"}`}
    >
      <input
        type="radio"
        name="color-theme"
        className="sr-only"
        onChange={onToggle}
        checked={toggled}
      />
      {children}
    </label>
  );
}
