import Elysia from "elysia";
import { ApiError } from "../lib/api-error";
import { prisma } from "../lib/prisma-client";
import { jwtPlugin } from "./jwt";

export const isAuth = new Elysia()
  .use(jwtPlugin)
  .derive({ as: "scoped" }, async (ctx) => {
    const token = ctx.headers.authorization?.split(" ")[1];
    const payload = await ctx.jwt.verify(token ?? "");
    if (!payload) throw new ApiError("Unauthorized", 401);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!user) {
      throw new ApiError("Unauthorized", 401);
    }

    return {
      user,
    };
  });
