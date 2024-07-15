import NextProgress from "next-progress";
import ServiceWorkerUpdater from "./components/service-worker-updater";

export default function App({ children }: any) {
  return (
    <>
      <ServiceWorkerUpdater />
      <NextProgress delay={200} options={{ showSpinner: false }} />
      {children}
    </>
  );
}
