import Elysia from "elysia";
import { ApiError } from "../../lib/api-error";
import { prisma } from "../../lib/prisma-client";

export const userRoutes = new Elysia().get(
  "/:username",
  async ({ params }) => {
    const user = await prisma.user.findUnique({
      where: {
        username: params.username,
      },
    });

    if (!user) {
      throw new ApiError("User not found!", 404);
    }

    return {
      ...user,
    };
  },
  {
    detail: {
      tags: ["User"],
      description: "Получение информации о юзере по username",
    },
  },
);
