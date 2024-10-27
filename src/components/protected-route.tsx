import { useNavigate } from "react-router-dom";
import { useGetAuthSession } from "../../orval/default/default";
import { useEffect } from "react";

export default function ProtectedRoute() {
  const router = useNavigate();

  const {
    data: session,
    error,
    isLoading,
    isValidating,
  } = useGetAuthSession({
    swr: {
      revalidateOnMount: true,
      revalidateIfStale: true,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 0,
    },
  });

  useEffect(() => {
    console.log(session, error);
    if (!isLoading && !isValidating && !session?.data) {
      console.log("PUSH login 1 ", session, error, isLoading, isValidating);
      router("/login");
    }
    // if (!isLoading && !isValidating && error) {
    //   console.log("PUSH login 2 ", session, error, isLoading, isValidating);
    //   router("/login");
    // }
  }, [session, error, isLoading, isValidating]);

  return null;
}
