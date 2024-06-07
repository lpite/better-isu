import { router } from './trpc';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

import { userRouter } from './routers/userRouter';
import { generalRouter } from './routers/generalRouter';
import { journalRouter } from './routers/journalRouter';

export const appRouter = router({
  user: userRouter,
  general: generalRouter,
  journal: journalRouter
});

export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;