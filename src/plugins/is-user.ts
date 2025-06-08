// plugins/is-auth.ts
import Elysia from "elysia";
import { prisma } from "../lib/prisma-client";
import { jwtPlugin } from "./jwt";

/**
 * Проверка на то авторизован ли пользователь
 */
export const isUser = new Elysia()
  .use(jwtPlugin)
  .derive({ as: "scoped" }, async (ctx) => {
    const token = ctx.headers.authorization?.split(" ")[1];
    const payload = await ctx.jwt.verify(token ?? "");
    if (!payload) return undefined;

    const user = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      return undefined;
    }

    return {
      user,
    };
  });
