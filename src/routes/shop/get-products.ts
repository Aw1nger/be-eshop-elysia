// routes/shop/get-product.ts
import Elysia from "elysia";
import { prisma } from "../../lib/prisma-client";
import { getOrCreateSignedUrl } from "../../lib/url-service";
import { SPaginationQuery } from "../../types/pagination.schema";

/**
 * Метод получения списка товаров с пагинацией
 */
export const getProductsRoutes = new Elysia().get(
  "",
  async ({ query }) => {
    const { page, limit } = query;

    const count = await prisma.product.count();
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        count: true,
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
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const serializedProducts = await serializeProductsParallel(products);

    return {
      products: serializedProducts,
      next: page * limit < count ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
    };
  },
  {
    query: SPaginationQuery,
    detail: {
      tags: ["Shop"],
      description: "Метод получения продуктов с пагинацией",
    },
  },
);

/**
 * Сериализует продукты, подписывая ссылки на изображения
 * Параллельная, быстрая версия
 */
export const serializeProductsParallel = async (products: any[]) => {
  const allPromises = products.map(async (product) => {
    const images = await Promise.all(
      product.images.map(async (media: any) => {
        const versionsWithSigned = await Promise.all(
          media.versions.map(async (version: any) => {
            const signedUrl = await getOrCreateSignedUrl(version.link);
            return {
              format: version.format,
              link: signedUrl ?? null,
            };
          }),
        );

        return {
          ...media,
          versions: versionsWithSigned,
        };
      }),
    );

    return {
      ...product,
      images,
    };
  });

  return Promise.all(allPromises);
};
