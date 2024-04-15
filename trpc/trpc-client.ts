import { httpBatchLink, httpLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '../trpc/router';


export const trpc = createTRPCNext<AppRouter>({
	config(opts) {
		return {
			links: [
				httpLink({
					/**
					 * If you want to use SSR, you need to use the server's full URL
					 * @link https://trpc.io/docs/v11/ssr
					 **/
					url: `/api/trpc`,
				}),
			],
		};
	},
	/**
	 * @link https://trpc.io/docs/v11/ssr
	 **/
	ssr: false,

});