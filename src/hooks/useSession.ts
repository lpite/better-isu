import { API_URL } from "@/config";
import loginPageParser from "@/data/loginPageParser";
import { useAppStore } from "@/stores/useAppStore";
import { useEffect } from "react";

const SESSION_TTL = 60 * 60 * 1000; // 1 hour

export function useSession() {
  const { session, user, setSessionStatus } = useAppStore();

  const status = session?.status;
  useEffect(() => {
    const refreshing = Boolean(localStorage.getItem("refreshing_session"));

    if (!session || !user) {
      setSessionStatus("unauthorised");
      return;
    }

    if (Date.now() - session.created_at > SESSION_TTL) {
      setSessionStatus("loading");
      console.log("passed");
      if (!refreshing) {
        localStorage.setItem("refreshing_session", "1");
        updateSession(user?.login, user?.password)
          .then((newSession) => {
            if (newSession) {
              setSessionStatus("authorised");

              useAppStore.setState((state) => ({
                ...state,
                session: newSession,
              }));
            } else {
              console.error("cant create newSession");
              setSessionStatus("unauthorised");
            }
          })
          .catch((err) => {
            console.error(err);
            setSessionStatus("unauthorised");
          })
          .finally(() => {
            localStorage.removeItem("refreshing_session");
          });
      }
    } else {
      setSessionStatus("authorised");

      // консол лог дуже важливий його не можна забирати))
      console.log("meow");
    }
  }, []);
  return { status, session };
}

async function updateSession(login: string, password: string) {
  const res = await fetch(
    `${API_URL}/api/proxy?url=https://isu1.khmnu.edu.ua/isu/dbsupport/logon.php`,
    {
      method: "POST",
      body: `login=${login}&passwd=${password}&btnSubmit=%D3%E2%B3%E9%F2%E8`,
    },
  );

  const result = await loginPageParser(res);
  console.log(res.headers.get("cookie"));
  const cookie = res.headers
    .get("cookie")
    ?.split(";")
    ?.find((el) => el.startsWith("isu_cookie"))
    ?.replace("isu_cookie=", "");
  console.log(result.success, document.cookie);
  if (result.success && cookie) {
    return {
      token: cookie.toString(),
      created_at: Date.now(),
    };
  }
  return null;
}
