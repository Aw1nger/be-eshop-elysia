import Elysia from "elysia";
import { ApiError } from "../../lib/api-error";
import { prisma } from "../../lib/prisma-client";
import { getOrCreateSignedUrl } from "../../lib/url-service";

export const getProductRoutes = new Elysia().get(
  "/:id",
  async ({ params }) => {
    const { id } = params;

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
      },
    });

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    const publicImages = await Promise.all(
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
      images: publicImages,
    };
  },
  {
    detail: {
      tags: ["Shop"],
      description: "Получение продукта по id",
    },
  },
);
