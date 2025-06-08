import Elysia from "elysia";
import { ApiError } from "../../lib/api-error";
import { prisma } from "../../lib/prisma-client";
import { getOrCreateSignedUrl } from "../../lib/url-service";
import { isUser } from "../../plugins/is-user";

export const getProductRoutes = new Elysia().use(isUser).get(
  "/:id",
  async ({ params, user }) => {
    const { id } = params;

    // Запрос к продукту с данными корзины
    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
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
                type: "thumb",
              },
              select: {
                format: true,
                link: true,
              },
            },
          },
        },
        cart: user
          ? {
              where: {
                userId: user.id,
                productId: Number(id),
              },
              select: {
                count: true,
              },
            }
          : undefined,
      },
    });

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    const cartCount = user && product.cart[0] ? product.cart[0].count : 0;

    const publicImages = await Promise.all(
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

    const { cart, ...productWithoutCart } = product;

    return {
      ...productWithoutCart,
      user: {
        ...product.user,
        avatar: product.user.avatar
          ? await getOrCreateSignedUrl(product.user.avatar)
          : null,
      },
      images: publicImages,
      cartCount,
    };
  },
  {
    detail: {
      tags: ["Shop"],
      description: "Получение продукта по id",
      responses: {
        "200": {
          description: "Успешный запрос",
          content: {},
        },
      },
    },
  },
);
