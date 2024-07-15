import Head from "next/head";
import "../styles/globals.css";

import type { AppProps } from "next/app";
import dynamic from "next/dynamic";

const LoadableApp = dynamic(() => import("@/App").then((m) => m.default));

function MyApp({ Component, pageProps }: AppProps) {
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
      </Head>
      <LoadableApp>
        <Component {...pageProps} />
      </LoadableApp>
    </>
  );
}

export default MyApp;
