import Elysia, { t } from "elysia";
import { prisma } from "../../lib/prisma-client";
import { isAuth } from "../../plugins/is-auth";

export const CreateProductSchema = t.Object({
  name: t.String({
    minLength: 2,
    maxLength: 128,
    messages: {
      type: "Поле 'name' должно быть строкой",
      minLength: "Название должно содержать минимум 2 символа",
      maxLength: "Название не должно превышать 128 символов",
    },
  }),
  description: t.String({
    minLength: 2,
    maxLength: 1024,
    messages: {
      type: "Поле 'description' должно быть строкой",
      minLength: "Описание должно содержать минимум 2 символа",
      maxLength: "Описание не должно превышать 1024 символов",
    },
  }),
  price: t.Number({
    min: 0,
    max: 2147483647,
    messages: {
      type: "Поле 'price' должно быть числом",
      min: "Цена не может быть отрицательной",
      max: "Цена не может превышать 2 147 483 647, соовесть то имей!",
    },
  }),
  count: t.Number({
    min: 0,
    max: 2147483647,
    messages: {
      type: "Поле 'count' должно быть числом",
      min: "Колличество не может быть отрицательным",
      max: "Колличество не может превышать 2 147 483 647, соовесть то имей!",
    },
  }),
});

export const createProductsRoutes = new Elysia().use(isAuth).post(
  "/create",
  async ({ body, user }) => {
    const { name, description, price, count } = body;

    const product = await prisma.product.create({
      data: {
        userId: user.id,
        name,
        description,
        price,
        count,
      },
    });

    return {
      id: product.id,
    };
  },
  {
    body: CreateProductSchema,
    detail: {
      tags: ["Shop"],
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  },
);
