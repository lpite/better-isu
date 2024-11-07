import { HomeIcon, UserIcon } from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";

export default function BottomNavigation() {
  return (
    <nav
      className="flex items-center justify-around w-full fixed bottom-0 pt-1.5 border dark:border-transparent border-slate-300 bg-zinc-50 dark:bg-zinc-900"
      style={{
        boxShadow: "0px -4px 4px 0px rgba(0, 0, 0, 4%)",
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
      }}
    >
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center leading-none ${isActive ? "text-blue-900 dark:text-blue-300" : "text-blue-300 dark:text-blue-800"}`
        }
      >
        <HomeIcon width={24} />
        Головна
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center leading-none ${isActive ? "text-blue-900 dark:text-blue-300" : "text-blue-300 dark:text-blue-800"}`
        }
      >
        <UserIcon width={24} />
        Студент
      </NavLink>
    </nav>
  );
}
