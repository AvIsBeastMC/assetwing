import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({
  deleteIssue: publicProcedure
    .input(z.object({
      account: z.string(),
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { account, id } = input;

      const deleteIssue = await prisma.issue.delete({
        where: {
          id
        }
      })

      return deleteIssue;
    }),
  resolveIssue: publicProcedure
    .input(z.object({
      account: z.string(),
      id: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { account, id } = input;

      const checkAccount = await prisma.user.findUnique({
        where: {
          id: account
        }
      })

      if (!checkAccount || checkAccount?.role !== 'admin') throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "UNAUTHORIZED"
      })

      const checkIfIssueExists = await prisma.issue.findUnique({
        where: {
          id
        }
      })

      if (!checkIfIssueExists) throw new TRPCError({
        code: "NOT_FOUND",
        message: "Issue with the given ID does not exist and hence, could NOT be updated."
      })

      const updateIssue = await prisma.issue.update({
        where: {
          id
        },
        data: {
          type: "resolved"
        }
      })

      return updateIssue;
    }),
  overview: publicProcedure
    .input(z.object({
      id: z.string(),
      password: z.string()
    }))
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { id, password } = input

      // Check Auth
      const account = await prisma.user.findUnique({
        where: {
          id,
        }
      })

      if (!account || account?.role !== 'admin') throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `Admin Account not found`
      })

      if (account.password !== password) throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `Incorrect Password - Password may have been changed.`
      })

      // Overview Time
      const issues = await prisma.issue.findMany({
        // include: {
        //   user: true,
        //   subItem: {
        //     include: {
        //       asset: true
        //     }
        //   }
        // }
      })
      const activeIssues = issues.filter((i) => i.type == 'pending');

      const assets = await prisma.asset.findMany({});

      const subItems = await prisma.subItem.findMany({})

      return {
        issues: activeIssues.length,
        assets: assets.length,
        subItems: subItems.length
      }
    }),
});