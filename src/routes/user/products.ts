import Elysia, { t } from "elysia";
import { prisma } from "../../lib/prisma-client";
import { getOrCreateSignedUrl } from "../../lib/url-service";

const query = t.Object({
  limit: t.Number({
    minimum: 1,
    default: 10,
  }),

  page: t.Number({
    minimum: 1,
    default: 1,
  }),
});

export const userProductsRoutes = new Elysia().get(
  "/:username/products",
  async ({ params, query }) => {
    const { page, limit } = query;

    const count = await prisma.product.count({
      where: {
        user: {
          username: params.username,
        },
      },
    });
    const products = await prisma.product.findMany({
      where: {
        user: {
          username: params.username,
        },
      },
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
    query,
    detail: {
      tags: ["User"],
      description: "Метод получения продуктов юзера с пагинацией",
    },
  },
);

export const serializeProductsParallel = async (products: any[]) => {
  const allPromises = products.map(async (product) => {
    const images = await Promise.all(
      product.images.map(async (media: any) => {
        const versionsWithSigned = await Promise.all(
          media.versions.map(async (version: any) => {
            const signedUrl = await getOrCreateSignedUrl(version.link);
            return {
              format: version.format,
              signedUrl: signedUrl ?? null,
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
