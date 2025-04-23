import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";

export const swaggerplugin = new Elysia().use(
  swagger({
    documentation: {
      info: {
        title:
          "Документация к куросовой работе студента группы №90 Бородина Никиты",
        version: "1.0.0",
      },
      tags: [
        { name: "Auth", description: "Ендпоинты аутентификации" },
        { name: "Shop", description: "Ендпоинты товаров" },
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
