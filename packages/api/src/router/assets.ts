import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const assetsRouter = createTRPCRouter({
  getIssuesOfAsset: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx;
      const id = input;

      const query = await prisma.issue.findMany({
        where: {
          assetId: id
        },
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

      const asset = await prisma.asset.findUnique({
        where: {
          id
        }
      })

      if (!asset) throw new TRPCError({
        code: "NOT_FOUND",
        message: "No Such Asset with the Given ID was found"
      })

      return {
        issues: query,
        asset
      }
    }),
  getSubItem: publicProcedure
    .input(z.string().nullable())
    .query(async ({ ctx, input: id }) => {
      const { prisma } = ctx;

      if (!id) return;

      const subItem = await prisma.subItem.findUnique({
        where: {
          id
        },
        include: {
          asset: true,
          issues: {
            include: {
              user: true
            }
          }
        }
      })

      if (!subItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sub-Item Data Given does not exist!"
        })
      }

      return subItem;
    }),
  getAsset: publicProcedure
    .input(z.string().optional().nullable())
    .query(async ({ ctx, input: id }) => {
      const { prisma } = ctx;

      if (!id || id == 'none') return undefined;

      const query = await prisma.asset.findUnique({
        where: {
          id
        },
        include: {
          images: true,
          issues: true,
          subItems: true,
        }
      })

      if (!query) throw new TRPCError({
        code: "NOT_FOUND",
        message: "No item exists with this ID"
      })

      return query;
    }),
  getAssets: publicProcedure.
    query(async ({ ctx }) => {
      const { prisma } = ctx;

      const query = await prisma.asset.findMany({
        include: {
          images: true,
          issues: true,
          subItems: {
            include: {
              asset: true
            }
          }
        }
      })

      return query;
    }),
});