import {
  Bars3Icon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  PowerIcon,
  SunIcon,
} from "@heroicons/react/24/outline";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import { usePostAuthLogout } from "../../orval/default/default";
import Spinner from "./spinner";

export default function HeaderWithBurger() {
  const { trigger: logoutTrigger, isMutating } = usePostAuthLogout();
  const navigate = useNavigate();
  function logout() {
    logoutTrigger().then(() => {
      navigate("/login");
    });
  }

  return (
    <header className="flex items-center justify-end px-4 pt-6 w-full fixed top-0">
      <Spinner show={isMutating} />
      <Sheet>
        <SheetTrigger>
          <Bars3Icon width={22} />
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl min-h-64 pt-2 px-6 dark:bg-slate-300"
        >
          <div className="flex justify-center">
            <div className="bg-slate-300 h-1 w-40 rounded-3xl"></div>
          </div>

          <SheetHeader className="w-full">
            <SheetTitle className="sr-only">Меню користувача</SheetTitle>
            <SheetDescription className="text-slate-900 w-full">
              <Link
                to="/appearance"
                className="flex items-center gap-1.5 border-b py-2"
              >
                <SunIcon width={24} />
                Зовнішній вигляд
              </Link>
              <Link
                to="https://t.me/lpite"
                className="flex items-center gap-1.5 border-b py-2"
              >
                <ExclamationCircleIcon width={24} />
                Повідомити про помилку
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-1.5 border-b py-2"
              >
                <InformationCircleIcon width={24} />
                Про додаток
              </Link>
              <button
                className="flex items-center w-full gap-1.5 border-b py-2 text-red-600"
                onClick={logout}
              >
                <PowerIcon width={24} />
                Вийти
              </button>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </header>
  );
}
