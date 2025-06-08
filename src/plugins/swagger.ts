// plugins/swagger.ts
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";

/**
 * Описывает развертывание Swagger для проекта
 */
export const swaggerplugin = new Elysia().use(
  swagger({
    scalarConfig: {
      hideDarkModeToggle: true,
      metaData: {
        title: "SwaggerDoc",
        description:
          "Документация к куросовой работе студента группы №90 Бородина Никиты",
        ogDescription:
          "Документация к куросовой работе студента группы №90 Бородина Никиты",
        ogTitle: "SwaggerDoc",
        ogImage: "https://example.com/image.png",
        twitterCard: "summary_large_image",
      },
      authentication: {
        securitySchemes: {
          httpBearer: {
            token: "",
          },
        },
      },
    },
    documentation: {
      info: {
        title:
          "Документация к куросовой работе студента группы №90 Бородина Никиты",
        version: "1.0.0",
      },
      tags: [
        { name: "Auth", description: "Ендпоинты аутентификации" },
        { name: "Shop", description: "Ендпоинты товаров" },
        { name: "User", description: "Ендпоинты юзера" },
        { name: "Cart", description: "Ендпоинты корзины" },
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
    theme: "dark",
    autoDarkMode: true,
  }),
);
