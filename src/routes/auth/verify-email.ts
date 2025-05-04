import Elysia, { t } from "elysia";
import { nanoid } from "nanoid";
import { prisma } from "../../lib/prisma-client";
import { redisClient } from "../../lib/redis-client";
import { jwtPlugin } from "../../plugins/jwt";

const verifyEmailSchema = t.Object({
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

export const verifyEmailRoutes = new Elysia().use(jwtPlugin).post(
  "/verify-email",
  async ({ body, set, jwt }) => {
    const { email, code } = body;

    const redisCode = await redisClient.get(`verification:${email}`);

    // Проверка наличия кода
    if (!redisCode) {
      set.status = 400;
      return { message: "Verification code not found or expired" };
    }

    // Проверка совпадения кода
    if (redisCode !== code) {
      set.status = 400;
      return { message: "Invalid verification code" };
    }

    const user = await prisma.user.update({
      where: { email },
      data: { trusted_email: true },
    });

    const accessToken = await jwt.sign({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar ?? "",
      role: user.role as "user" | "admin",
    });

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
  },
  {
    body: verifyEmailSchema,
    detail: {
      tags: ["Auth"],
      description: "Подтверджение email при регистрации",
    },
  },
);
