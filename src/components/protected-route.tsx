import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "@/stores/useAppStore";

export default function ProtectedRoute() {
  const router = useNavigate();
  const { session } = useAppStore();

  // const {
  //   data: session,
  //   error,
  //   isLoading,
  //   isValidating,
  // } = useGetAuthSession({
  //   swr: {
  //     revalidateOnMount: true,
  //     revalidateIfStale: true,
  //     revalidateOnFocus: true,
  //     revalidateOnReconnect: true,
  //     dedupingInterval: 0,
  //   },
  // });

  useEffect(() => {
    console.log(session);
    if (!session) {
      router("/login");
    }
    // if (!isLoading && !isValidating && error) {
    //   console.log("PUSH login 2 ", session, error, isLoading, isValidating);
    //   router("/login");
    // }
  }, [session]);

  return null;
}
