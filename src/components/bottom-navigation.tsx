import { House, User } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function BottomNavigation() {
  return (
    <nav
      className="flex items-center justify-around w-full fixed bottom-0 pt-1.5 border-t dark:border-slate-600 border-slate-300 bg-card"
      style={{
        boxShadow: "0px -4px 4px 0px rgba(0, 0, 0, 4%)",
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
      }}
    >
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center leading-none ${isActive ? "text-primary" : "opacity-50"}`
        }
      >
        <House />
        Головна
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center leading-none ${isActive ? "text-primary" : "opacity-50"}`
        }
      >
        <User />
        Студент
      </NavLink>
    </nav>
  );
}
