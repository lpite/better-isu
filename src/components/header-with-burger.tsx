import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import { Bug, Info, LogOut, Menu, Sun } from "lucide-react";

export default function HeaderWithBurger() {
  const navigate = useNavigate();
  function logout() {
    useAppStore.setState({
      user: undefined,
      session: undefined,
    });
    navigate("/login");
  }

  return (
    <header className="flex items-center justify-end px-4 pt-6 w-full fixed top-0">
      <Sheet>
        <SheetTrigger>
          <Menu />
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl min-h-64 pt-2 px-6 bg-background"
        >
          <div className="flex justify-center">
            <div className="bg-slate-300 h-1 w-40 rounded-3xl"></div>
          </div>

          <SheetHeader className="w-full">
            <SheetTitle className="sr-only">Меню користувача</SheetTitle>
            <SheetDescription className="text-foreground w-full">
              <Link
                to="/appearance"
                className="flex items-center gap-2 border-b py-2"
              >
                <Sun width={24} />
                Зовнішній вигляд
              </Link>
              <Link
                to="https://t.me/lpite"
                className="flex items-center gap-2 border-b py-2"
              >
                <Bug />
                Повідомити про помилку
              </Link>
              <Link
                to="/about"
                className="flex items-center gap-2 border-b py-2"
              >
                <Info />
                Про додаток
              </Link>
              <button
                className="flex items-center w-full gap-2 border-b py-2 text-red-600"
                onClick={logout}
              >
                <LogOut />
                Вийти
              </button>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </header>
  );
}
