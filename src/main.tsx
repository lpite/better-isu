import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainPage from "./pages/main";
import ProfilePage from "./pages/profile";
import AppearancePage from "./pages/appearance";
import AboutPage from "./pages/about";
import RatingPage from "./pages/rating";
import { ThemeProvider } from "./components/theme-provider";
import LoginPage from "./pages/login";
import JournalPage from "./pages/journal";
import { SWRConfig } from "swr";
import LoadingIndicators from "./components/loading-indicators";

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
  const cacheVersion = "1.0";
  const cacheKey = "app-cache_" + cacheVersion;
  // When initializing, we restore the data from `localStorage` into a map.
  const map = new Map<any, any>(
    JSON.parse(localStorage.getItem(cacheKey) || "[]"),
  );

  // Before unloading the app, we write back all the data into `localStorage`.
  window.addEventListener("beforeunload", () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem(cacheKey, appCache);
  });

  // We still use the map for write & read for performance.
  return map;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SWRConfig value={{ provider: localStorageProvider }}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <LoadingIndicators/>
        <RouterProvider router={router} />
      </ThemeProvider>
    </SWRConfig>
  </React.StrictMode>,
);
