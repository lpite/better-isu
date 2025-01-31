import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainPage from "./pages/main.tsx";
import ProfilePage from "./pages/profile.tsx";
import AppearancePage from "./pages/appearance.tsx";
import AboutPage from "./pages/about.tsx";
import RatingPage from "./pages/rating.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import LoginPage from "./pages/login.tsx";
import JournalPage from "./pages/journal.tsx";
import { SWRConfig } from "swr";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "/journals",
    element: <MainPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/appearance",
    element: <AppearancePage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/rating",
    element: <RatingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/journal/:index",
    element: <JournalPage />,
  },
]);

function localStorageProvider() {
  // When initializing, we restore the data from `localStorage` into a map.
  const map = new Map<any, any>(
    JSON.parse(localStorage.getItem("app-cache") || "[]"),
  );

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener("beforeunload", () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem("app-cache", appCache);
  });

  // We still use the map for write & read for performance.
  return map;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SWRConfig value={{ provider: localStorageProvider }}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </SWRConfig>
  </React.StrictMode>,
);
