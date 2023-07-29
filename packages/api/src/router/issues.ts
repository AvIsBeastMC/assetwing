import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const issuesRouter = createTRPCRouter({
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
