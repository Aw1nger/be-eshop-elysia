import Elysia from "elysia";
import { ApiError } from "../../lib/api-error";
import { prisma } from "../../lib/prisma-client";

export const deleteProductRoutes = new Elysia().delete(
  "/:id",
  async ({ params }) => {
    const result = await prisma.product.delete({
      where: {
        id: Number(params.id),
      },
    });

    if (!result) {
      throw new ApiError("Product not found", 404);
    }

    return {
      message: "ok",
    };
  },
  {
    tags: ["Shop"],
  },
);
