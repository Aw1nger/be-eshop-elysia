import { t } from "elysia";
import { nanoid } from "nanoid";
import { prisma } from "../../lib/prisma-client";
import { redisClient } from "../../lib/redis-client";

// Схема валидации тела запроса
export const verifyEmailSchema = t.Object({
  email: t.String({
    format: "email",
    error: "Invalid email :(",
  }),
  code: t.String({
    min: 6,
    max: 6,
    error: "Invalid verification code :(",
  }),
});

// Обработчик верификации email
export const verifyEmail = async (ctx: {
  body: { email: string; code: string };
  set: { status: number };
  jwt: {
    sign: (
      payload: Record<string, any>,
      options?: { exp?: string },
    ) => Promise<string>;
  };
}) => {
  const { email, code } = ctx.body;

  const redisCode = await redisClient.get(`verification:${email}`);

  // Проверка наличия кода
  if (!redisCode) {
    ctx.set.status = 400;
    return { message: "Verification code not found or expired" };
  }

  // Проверка совпадения кода
  if (redisCode !== code) {
    ctx.set.status = 400;
    return { message: "Invalid verification code" };
  }

  const user = await prisma.user.update({
    where: { email },
    data: { trusted_email: true },
  });

  const accessToken = await ctx.jwt.sign(
    { id: user.id, email: user.email },
    { exp: "15m" },
  );

  const refreshToken = nanoid(64);
  await redisClient.setEx(
    `refresh:${user.id}:${refreshToken}`,
    7 * 24 * 60 * 60,
    "true",
  );

  await redisClient.del(`verification:${email}`);

  return {
    message: "Email verified successfully",
    accessToken,
    refreshToken,
  };
};
