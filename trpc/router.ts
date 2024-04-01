import { router } from './trpc';
import { userRouter } from './routers/userRouter';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { generalRouter } from './routers/generalRouter';

export const appRouter = router({
  user: userRouter,
  general: generalRouter
});

export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;