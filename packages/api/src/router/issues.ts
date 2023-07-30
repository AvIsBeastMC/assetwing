import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const issuesRouter = createTRPCRouter({
  getIssue: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const id = input;

      const query = await prisma.issue.findUnique({
        where: {
          id
        },
        include: {
          comments: true,
          user: true,
          asset: {
            include: {
              images: true
            }
          },
          subItem: true
        }
      })

      if (!query) throw new TRPCError({
        code: "NOT_FOUND",
        message: "No Such Issue exists with the provided ID"
      })

      return query;
    }),
  getAllIssues: publicProcedure
    .query(async ({ ctx }) => {
      const { prisma } = ctx;

      const query = await prisma.issue.findMany({
        include: {
          subItem: true,
          asset: {
            include: {
              images: true
            }
          },
          user: true
        }
      })

      return query;
    }),
  new: publicProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(),
      asset: z.string(),
      subItem: z.string(),
      user: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      const { user, title, description, asset, subItem } = input;
      const { prisma } = ctx;

      const query = await prisma.issue.create({
        data: {
          title,
          description,
          subItem: {
            connect: {
              id: subItem
            }
          },
          user: {
            connect: {
              id: user
            }
          },
          asset: {
            connect: {
              id: asset
            }
          }
        }
      })

      return query;
    }),
});
