import Head from 'next/head'
import '../styles/globals.css'

import { trpc } from "../trpc/trpc-client"

import type { AppProps } from 'next/app'
import ServiceWorkerUpdater from '@/components/service-worker-updater'
import NextProgress from 'next-progress'
 
import posthog from "posthog-js"
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') { // checks that we are client-side
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug() // debug mode in development
    },
  })
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Capybara</title>
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#020817" />

      </Head>  
      <ServiceWorkerUpdater />
      <NextProgress delay={200} options={{ showSpinner: false }} />
      <PostHogProvider client={posthog}>
        <Component {...pageProps} />
      </PostHogProvider>
    </>)
}

export default trpc.withTRPC(MyApp)