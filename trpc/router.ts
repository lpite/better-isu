import { z } from 'zod';
import { procedure, router } from './trpc';
import { userRouter } from './routers/userRouter';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export const appRouter = router({
  hello: procedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
    user:userRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;