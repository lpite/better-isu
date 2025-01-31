import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import loginPageParser from "@/data/loginPageParser";
import { useAppStore } from "@/stores/useAppStore";

export default function LoginPage() {
  const router = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState({
    login: "",
    password: "",
  });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const res = await fetch(
      "/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/logon.php",
      {
        method: "POST",
        body: `login=${credentials.login}&passwd=${credentials.password}&btnSubmit=%D3%E2%B3%E9%F2%E8`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    ).finally(() => {
      setIsLoading(false);
    });

    const result = await loginPageParser(res);
    const cookie = document.cookie
      .split(";")
      .find((el) => el.startsWith("isu_cookie"))
      ?.replace("isu_cookie=", "");
    if (result.success && cookie) {
      useAppStore.setState((state) => ({
        ...state,
        session: {
          token: cookie.toString(),
          created_at: new Date(),
        },
        user: {
          login: credentials.login,
          password: credentials.password,
        },
      }));
      router("/");
      return;
    }
    setError(result.error || "");
  }

  return (
    <main className="flex justify-center items-center h-full">
      <form className="space-y-8" style={{ minWidth: 300 }} onSubmit={onSubmit}>
        {isLoading ? (
          <div
            className="fixed inset-x-0 inset-y-0 w-full h-full flex justify-center items-center"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="w-3 absolute border-4 border-blue-600 p-4 rounded-full border-b-transparent animate-spin"></div>
          </div>
        ) : null}
        <label>
          <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Логін
          </span>
          <Input
            onChange={(e) =>
              setCredentials((v) => ({
                ...v,
                login: e.target.value,
              }))
            }
            placeholder="capybara"
            type="text"
            className="text-base"
            autoComplete="login"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Пароль
          </span>
          <Input
            onChange={(e) =>
              setCredentials((v) => ({
                ...v,
                password: e.target.value,
              }))
            }
            placeholder="********"
            type="password"
            className="text-base"
          />
        </label>
        <span className="text-red-400">{error}</span>
        <Button
          type="submit"
          className="w-full"
          disabled={
            isLoading ||
            !credentials.login.length ||
            !credentials.password.length
          }
        >
          Увійти
        </Button>
      </form>
    </main>
  );
}
