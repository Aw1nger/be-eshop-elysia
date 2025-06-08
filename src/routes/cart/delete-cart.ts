import { Prisma } from "@prisma/client";
import Elysia from "elysia";
import { ApiError } from "../../lib/api-error";
import { prisma } from "../../lib/prisma-client";
import { isAuth } from "../../plugins/is-auth";

export const deleteProductRoute = new Elysia().use(isAuth).delete(
  "/:id",
  async ({ params, user }) => {
    try {
      const productId = Number(params.id);

      if (isNaN(productId)) {
        throw new ApiError("Invalid product ID", 400);
      }

      await prisma.cart.delete({
        where: {
          userId_productId: {
            userId: user.id,
            productId: productId,
          },
        },
      });

      return {
        message: "Product deleted successfully",
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new ApiError(
          "Product not found or you don't have permission",
          404,
        );
      }

      if (error instanceof ApiError) {
        throw error;
      }

      console.error("Delete product error:", error);
      throw new ApiError("Internal server error", 500);
    }
  },
  {
    detail: {
      tags: ["Shop"],
      description: "Метод удаления продукта из корзины",
      responses: {
        "200": {
          description: "Продукт успешно удален",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  data: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        "400": { description: "Неверный ID продукта" },
        "404": { description: "Продукт не найден или нет прав" },
        "500": { description: "Внутренняя ошибка сервера" },
      },
    },
  },
);
