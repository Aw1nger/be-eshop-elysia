import Elysia from "elysia";
import { prisma } from "../../lib/prisma-client";

export const getProductsRoutes = new Elysia().get(
  "",
  async () => {
    const products = await prisma.product.findMany({
      select: {
        name: true,
        description: true,
        price: true,
        count: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    return {
      products,
    };
  },
  {
    detail: {
      tags: ["Shop"],
    },
  },
);
