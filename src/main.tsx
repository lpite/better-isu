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
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);
