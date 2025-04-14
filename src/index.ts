import jwt from "@elysiajs/jwt";
import swagger from "@elysiajs/swagger";
import Elysia from "elysia";
import { ApiError } from "../lib/api-error";
import { refreshToken, refreshTokenSchema } from "../routes/user/refresh-token";
import { registerSchema, registerUser } from "../routes/user/register";
import { verifyEmail, verifyEmailSchema } from "../routes/user/verify-email";

// Инициализация приложения
const app = new Elysia();

// Глобальная обработка ошибок
app.onError(({ error, set, path }) => {
  console.log(`Error in ${path}:`, error);

  if (error instanceof ApiError) {
    set.status = error.status;
    return {
      message: error.message,
      route: error.context?.route || path,
      details: error.context?.details,
    };
  }

  console.error("Unexpected error:", error);
  set.status = 500;
  return { message: "Internal server error" };
});

// Инициализация Swagger
app.use(
  swagger({
    documentation: {
      info: {
        title:
          "Документация к куросовой работе студента группы №90 Бородина Никиты",
        version: "1.0.0",
      },
      tags: [
        { name: "Auth", description: "Ендпоинты аутентификации" },
        { name: "App", description: "Ендпоинты приложения" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  }),
);

// Инициализация JWT
app.use(
  jwt({
    name: "jwt",
    secret: Bun.env.JWT_SECRET || "your-secret-key",
    exp: "1h",
  }),
);

// Определение маршрутов
app.group("/user", (app) =>
  app
    .post("/register", registerUser, {
      body: registerSchema,
      detail: { tags: ["Auth"] },
    })
    .post("/verify-email", verifyEmail, {
      body: verifyEmailSchema,
      detail: { tags: ["Auth"] },
    })
    .post("/refresh-token", refreshToken, {
      body: refreshTokenSchema,
      detail: { tags: ["Auth"] },
    }),
);

// Запуск сервера
app.listen(8000, () => {
  console.info("Server started on port 8000");
});
