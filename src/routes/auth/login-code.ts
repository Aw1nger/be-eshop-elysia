import Elysia, { t } from "elysia";
import { nanoid } from "nanoid";
import { prisma } from "../../lib/prisma-client";
import { redisClient } from "../../lib/redis-client";
import { jwtPlugin } from "../../plugins/jwt";

export const loginCodeSchema = t.Object({
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

export const loginCodeRoutes = new Elysia().use(jwtPlugin).post(
  "/login-code",
  async ({ body, set, jwt }) => {
    const { email, code } = body;

    const redisCode = await redisClient.get(`code:${email}`);

    if (!redisCode) {
      set.status = 400;
      return { message: "Invalid verification code" };
    }

    if (redisCode !== code) {
      set.status = 400;
      return { message: "Invalid verification code" };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      set.status = 404;
      return { message: "User not found" };
    }

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

    await redisClient.del(`code:${email}`);

    return {
      message: "Login successful",
      accessToken,
      refreshToken,
    };
  },
  {
    body: loginCodeSchema,
    detail: {
      tags: ["Auth"],
      description: "Ввод кода с email и получение JWT если он верен",
    },
  },
);
