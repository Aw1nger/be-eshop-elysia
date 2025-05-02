import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";

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
            token:
              "eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MiwiZW1haWwiOiJhdzFuZ2VyQHlhbmRleC5ydSIsInVzZXJuYW1lIjoiYXcxbmdlciIsImF2YXRhciI6IiIsInJvbGUiOiJ1c2VyIiwiZXhwIjoxNzQ1NjkyMTQyfQ.4gmXJ-WAbbAhbmmvmp_HExCpx2AJ853IpMIvevfHV1s",
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
