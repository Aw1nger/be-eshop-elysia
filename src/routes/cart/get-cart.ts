import Elysia from "elysia";
import { prisma } from "../../lib/prisma-client";
import { getOrCreateSignedUrl } from "../../lib/url-service";
import { isAuth } from "../../plugins/is-auth";
import { SPaginationQuery } from "../../types/pagination.schema";

export const getCartRoute = new Elysia().use(isAuth).get(
  "",
  async ({ query, user }) => {
    const { page, limit } = query;

    const count = await prisma.cart.count({
      where: {
        userId: user.id,
      },
    });

    const cart = await prisma.cart.findMany({
      where: {
        userId: user.id,
      },
      select: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            user: {
              select: {
                username: true,
                avatar: true,
              },
            },
            images: {
              select: {
                id: true,
                versions: {
                  where: {
                    type: "preview",
                  },
                  select: {
                    format: true,
                    link: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const serializedCartParallel = async () => {
      const allPromises = cart.map(async (product) => {
        const user = {
          ...product.product.user,
          avatar: product.product.user.avatar
            ? await getOrCreateSignedUrl(product.product.user.avatar)
            : null,
        };

        const images = await Promise.all(
          product.product.images.map(async (item) => {
            const versions = await Promise.all(
              item.versions.map(async (version) => ({
                ...version,
                link: await getOrCreateSignedUrl(version.link),
              })),
            );

            return {
              ...item,
              versions,
            };
          }),
        );

        return {
          ...product.product,
          user,
          images,
        };
      });

      return Promise.all(allPromises);
    };

    const serializedCart = await serializedCartParallel();

    return {
      cart: serializedCart,
      next: page * limit < count ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
    };
  },
  {
    query: SPaginationQuery,
    detail: {
      description: "Метод получения корзины пользователя",
    },
  },
);
