import { t } from "elysia";
import { prisma } from "../../lib/prisma-client";
import { redisClient } from "../../lib/redis-client";

// Схема валидации тела запроса
export const refreshTokenSchema = t.Object({
  refreshToken: t.String({
    minLength: 64,
    maxLength: 64,
    error: "Invalid refresh token",
  }),
});

// Обработчик рефреша токена
export const refreshToken = async (ctx: {
  body: { refreshToken: string };
  set: { status: number };
  jwt: {
    sign: (
      payload: Record<string, any>,
      options?: { exp?: string },
    ) => Promise<string>;
  };
}) => {
  const { refreshToken } = ctx.body;

  // Ищем refresh-токен в Redis
  const keys = await redisClient.keys(`refresh:*:${refreshToken}`);
  if (keys.length === 0) {
    ctx.set.status = 401;
    return { message: "Invalid or expired refresh token" };
  }

  // Извлекаем userId из ключа
  const userId = keys[0].split(":")[1];
  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });

  if (!user) {
    ctx.set.status = 401;
    return { message: "User not found" };
  }

  // Генерируем новый access-токен
  const accessToken = await ctx.jwt.sign(
    { id: user.id, email: user.email },
    { exp: "15m" },
  );

  return {
    message: "Token refreshed successfully",
    accessToken,
  };
};
