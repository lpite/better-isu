import { Button } from "@/components/ui/button";

import React, { FormEvent } from "react";
import { useRouter } from "next/router";
import { Input } from "@/components/ui/input";
import { LoginResponse } from "./api/login";
import { useGetAuthSession } from "orval/default/default";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [credentials, setCredentials] = React.useState({
    login: "",
    password: "",
  });

  const {
    data: session,
    isLoading: isLoadingSession,
    isValidating: isValidatingSession,
  } = useGetAuthSession();

  React.useEffect(() => {
    if (!isLoadingSession && !isValidatingSession && session?.data) {
      router.push("/");
    }
  }, [router, isLoadingSession, isValidatingSession, session]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    const res: LoginResponse | undefined = await fetch("/api/hono/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .finally(() => {
        setIsLoading(false);
      });

    if (res?.error) {
      setError(res.error);
    }

    if (res?.data || res?.error === "already") {
      router.push("/");
    }
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
              setCredentials((v) => ({ ...v, login: e.target.value }))
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
              setCredentials((v) => ({ ...v, password: e.target.value }))
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
