import Elysia from "elysia";
import { prisma } from "../../lib/prisma-client";
import { isAuth } from "../../plugins/is-auth";

export const getSumRoute = new Elysia().use(isAuth).get(
  "/sum",
  async ({ user }) => {
    const cart = await prisma.cart.findMany({
      where: {
        userId: user.id,
      },
      select: {
        product: {
          select: {
            price: true,
          },
        },
      },
    });

    return cart.reduce((acc, curr) => acc + Number(curr.product.price), 0);
  },
  {
    detail: {
      description: "Метод получения суммы корзины пользователя",
    },
  },
);
