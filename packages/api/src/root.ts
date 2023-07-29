import { adminRouter } from "./router/admin";
import { assetsRouter } from "./router/assets";
import { authRouter } from "./router/auth";
import { issuesRouter } from "./router/issues";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  admin: adminRouter,
  assets: assetsRouter,
  issues: issuesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
