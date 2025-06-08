// routes/auth/refresh-token.ts
import Elysia, { t } from "elysia";
import { generateSignedUrl } from "../../lib/generate-signed-url";
import { prisma } from "../../lib/prisma-client";
import { redisClient } from "../../lib/redis-client";
import { jwtPlugin } from "../../plugins/jwt";

export const refreshTokenSchema = t.Object({
  refreshToken: t.String({
    minLength: 64,
    maxLength: 64,
    error: "Invalid refresh token",
  }),
});

/**
 * Метод для рефреша токена
 */
export const refreshTokenRoutes = new Elysia().use(jwtPlugin).post(
  "/refresh-token",
  async ({ body, set, jwt }) => {
    const { refreshToken } = body;

    const keys = await redisClient.keys(`refresh:*:${refreshToken}`);
    if (keys.length === 0) {
      set.status = 401;
      return { message: "Invalid or expired refresh token" };
    }

    const userId = keys[0].split(":")[1];
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      set.status = 401;
      return { message: "User not found" };
    }

    const accessToken = await jwt.sign({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar ? await generateSignedUrl(user.avatar) : "",
      role: user.role,
    });

    return {
      message: "Token refreshed successfully",
      accessToken,
    };
  },
  {
    body: refreshTokenSchema,
    detail: {
      tags: ["Auth"],
      description: "Ревреш access токена с помощью рефреш токена",
    },
  },
);
