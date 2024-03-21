import Head from 'next/head'
import '../styles/globals.css'

import { trpc } from "../trpc/trpc-client"

import type { AppProps } from 'next/app'
 
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Capybara</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
      </Head>  
      <Component {...pageProps} />
    </>)
}

export default trpc.withTRPC(MyApp)