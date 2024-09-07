import Head from "next/head";
import "../styles/globals.css";

import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";

const LoadableApp = dynamic(() => import("@/App").then((m) => m.default));

function MyApp({ Component, pageProps }: AppProps) {
  const [isVercel, setIsVercel] = useState(false);
  useEffect(() => {
    if (location.href.includes("vercel")) {
      setIsVercel(true);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Capybara</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/favicon-16x16.png"
        />
        <link
          rel="mask-icon"
          href="/icons/safari-pinned-tab.svg"
          color="#5bbad5"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#020817" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>
      <LoadableApp>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          // disableTransitionOnChange
        >
          {isVercel ? (
            <div className="h-100 w-100 fixed bg-slate-900 top-0 right-0 left-0 bottom-0 z-10 flex flex-col items-center justify-center">
              <h1 className="text-4xl mb-2 text-center">
                Перейдіть будь ласка на сервер хну
              </h1>
              <h2 className="text-2xl text-center">
                і так воно буде казати, що зʼєднання небезпечне <br />
                на жаль з чим нічого не можна зробити (наразі)
              </h2>
              <a
                href="https://78.152.183.61:8443/login"
                className="m-4 px-4 py-2 rounded-xl bg-pink-900 border-2 text-xl"
              >
                тицніть тут щоб перейти
              </a>
            </div>
          ) : null}

          <Component {...pageProps} />
        </ThemeProvider>
      </LoadableApp>
    </>
  );
}

export default MyApp;
