import { useEffect } from "react";

export default function ServiceWorkerUpdater() {
  useEffect(() => {
    //@ts-ignore
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      //@ts-ignore
      const wb = window.workbox;

      const promptNewVersionAvailable = () => {
        if (confirm("Доступна нова версія оновитися?")) {
          wb.addEventListener("controlling", () => {
            window.location.reload();
          });

          wb.messageSkipWaiting();
        }
      };

      wb.addEventListener("waiting", promptNewVersionAvailable);
    }
  }, []);
  return null;
}
