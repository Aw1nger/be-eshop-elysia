import { User, UserRole } from "@prisma/client";
import Elysia, { t } from "elysia";
import { ApiError } from "../../lib/api-error";
import { generateSignedUrl } from "../../lib/generate-signed-url";
import { prisma } from "../../lib/prisma-client";

/**
 * Метод получения информации о юзере по username
 */
export const userRoutes = new Elysia().get(
  "/:username",
  async ({ params }) => {
    const user: User | null = await prisma.user.findUnique({
      where: {
        username: params.username,
      },
    });

    if (!user) {
      throw new ApiError("User not found!", 404);
    }

    return {
      ...user,
      avatar: user.avatar ? await generateSignedUrl(user.avatar) : null,
    };
  },
  {
    detail: {
      tags: ["User"],
      description: "Получение информации о юзере по username",
    },
    response: {
      200: t.Object({
        id: t.Number(),
        email: t.String(),
        username: t.String(),
        avatar: t.Nullable(t.String()),
        role: t.Enum(UserRole),
        trusted_email: t.Boolean(),
      }),
      404: t.Object({
        message: t.String(),
        statusCode: t.Number(),
      }),
    },
  },
);
