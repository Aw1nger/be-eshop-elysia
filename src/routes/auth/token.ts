// routes/auth/token.ts
import Elysia from "elysia";
import { isAuth } from "../../plugins/is-auth";

/**
 * Проверка не был ли подделан access token
 */
export const tokenRoutes = new Elysia()
  .use(isAuth)
  .post("/token", async () => {}, {
    detail: {
      tags: ["Auth"],
      description: "Проверка не был ли подделан access токен",
    },
  });
