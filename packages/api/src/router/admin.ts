import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const adminRouter = createTRPCRouter({
  updateIssue: publicProcedure
    .input(z.object({
      id: z.string(),
      account: z.string(),
      title: z.string(),
      description: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { id, account, title, description } = input;

      const checkAccount = await prisma.user.findUnique({
        where: {
          id: account
        }
      })

      if (!checkAccount || checkAccount?.role !== 'admin') throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "UNAUTHORIZED"
      })

      const update = await prisma.issue.update({
        where: {
          id
        },
        data: {
          title, description
        }
      })

      return update;
    }),
  deleteAsset: publicProcedure
    .input(z.object({
      id: z.string(),
      account: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { id, account } = input;

      const checkAccount = await prisma.user.findUnique({
        where: {
          id: account
        }
      })

      if (!checkAccount || checkAccount?.role !== 'admin') throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "UNAUTHORIZED"
      })

      const query = await prisma.asset.delete({
        where: {
          id
        }
      })

      return query;
    }),
  createSubItem: publicProcedure
    .input(z.object({
      asset: z.string(),
      account: z.string(),
      name: z.string(),
      additionalInformation: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { asset, account, name, additionalInformation } = input;

      const checkAccount = await prisma.user.findUnique({
        where: {
          id: account
        }
      })

      if (!checkAccount || checkAccount?.role !== 'admin') throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "UNAUTHORIZED"
      })

      const checkAsset = await prisma.asset.findUnique({
        where: {
          id: asset
        }
      })

      if (!checkAsset) throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Asset with the given ID does not exist!"
      })

      const createSubItemUnderAsset = await prisma.asset.update({
        where: {
          id: asset
        },
        data: {
          subItems: {
            create: {
              name,
              additionalInformation
            }
          }
        }
      })

      return createSubItemUnderAsset;
    }),
  createAsset: publicProcedure
    .input(z.object({
      account: z.string(),
      title: z.string(),
      description: z.string(),
      mentionedQuantity: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const { account, title, description, mentionedQuantity } = input;

      const checkAccount = await prisma.user.findUnique({
        where: {
          id: account
        }
      })

      if (!checkAccount || checkAccount?.role !== 'admin') throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "UNAUTHORIZED"
      })

      const createAsset = await prisma.asset.create({
        data: {
          title,
          description,
          quantity: mentionedQuantity
        }
      })

      return createAsset;
    }),
  deleteIssue: publicProcedure
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