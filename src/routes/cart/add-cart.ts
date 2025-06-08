import Elysia, { t } from "elysia";
import { ApiError } from "../../lib/api-error";
import { prisma } from "../../lib/prisma-client";
import { isAuth } from "../../plugins/is-auth";

const AddProductSchema = t.Object({
  count: t.Number({ minimum: 1, default: 1 }),
});

export const addProductRoute = new Elysia().use(isAuth).post(
  "/:id",
  async ({ body, user, params }) => {
    const id = Number(params.id);
    const { count } = body;

    if (!id) throw new ApiError("ID is required", 400);

    const product = await prisma.product.findUnique({
      where: {
        id: id,
      },
    });

    if (!product || product.count < count)
      throw new ApiError("Product not found or count out of range", 400);

    await prisma.cart.create({
      data: {
        userId: user.id,
        productId: id,
        count,
      },
    });
  },
  {
    body: AddProductSchema,
    detail: {
      description: "Метод добавления товара в корзину",
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        "200": {
          description: "Успешное добавление товара в корзину",
        },
      },
    },
  },
);
