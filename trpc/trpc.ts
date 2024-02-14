import { TRPCError, initTRPC } from '@trpc/server';
import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import getSession from 'utils/getSession';


export const createContext = async (opts: CreateNextContextOptions) => {
	const session = await getSession(opts.req);
	
	return {
		session: session,
	};
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create()


export const router = t.router;
export const procedure = t.procedure.use(({ next, ctx }) => {

	if (!ctx.session?.data) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
		});
	}


	return next({
		ctx: {
			session: ctx.session.data
		}
	})
});