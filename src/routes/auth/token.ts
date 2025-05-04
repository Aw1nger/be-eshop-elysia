import Elysia from "elysia";
import { isAuth } from "../../plugins/is-auth";

export const tokenRoutes = new Elysia()
  .use(isAuth)
  .post("/token", async () => {}, {
    detail: {
      tags: ["Auth"],
      description: "Проверка не был ли подделан access токен",
    },
  });
