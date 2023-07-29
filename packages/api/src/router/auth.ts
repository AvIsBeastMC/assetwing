import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  getSession: publicProcedure
    .input(z.object({
      email: z.string().optional(),
      password: z.string(),
      id: z.string().optional()
    }))
    .mutation(async ({ ctx, input }) => {
      const { email, password, id } = input;
      const { prisma } = ctx;

      if (email) {
        const user = await prisma.user.findUnique({
          where: {
            email,
          },
          include: {
            issues: {
              include: {
                asset: true
              }
            }
          }
        })

        if (!user) throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account with this email does not exist"
        })

        if (user?.password !== password) throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Incorrect Password"
        })

        return user;
      } else if (id) {
        const user = await prisma.user.findUnique({
          where: {
            id,
          },
          include: {
            issues: {
              include: {
                asset: true
              }
            }
          }
        })

        if (!user) throw new TRPCError({
          code: "NOT_FOUND",
          message: "Account with this email does not exist"
        })

        if (user?.password !== password) throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Incorrect Password"
        })

        return user;
      } else throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found"
      })
    }),
  getSecretMessage: protectedProcedure.query(() => {
    // testing type validation of overridden next-auth Session in @acme/auth package
    return "you can see this secret message!";
  }),
});
