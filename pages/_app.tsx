import '../styles/globals.css'

import { trpc } from "../trpc/trpc-client"

import type { AppProps } from 'next/app'
 
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default trpc.withTRPC(MyApp)