import NextProgress from "next-progress";
import ServiceWorkerUpdater from "./components/service-worker-updater";

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

export default function App({ children }: any) {
	return (
		<>
			<ServiceWorkerUpdater />
			<NextProgress delay={200} options={{ showSpinner: false }} />
			<PostHogProvider client={posthog}>
				{children}
			</PostHogProvider>
		</>
	)
}