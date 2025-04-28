import Elysia from "elysia";
import { prisma } from "../../lib/prisma-client";

export const getProduct = new Elysia().get("/:id", async ({ params }) => {
  const { id } = params;

  const product = await prisma.product.findUnique({
    where: {
      id: Number(id),
    },
  });

  return product;
});
