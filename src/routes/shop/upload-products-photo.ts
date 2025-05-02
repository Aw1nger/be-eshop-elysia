import { MediaType } from "@prisma/client";
import Elysia, { t } from "elysia";
import sharp from "sharp";
import { ApiError } from "../../lib/api-error";
import { minio } from "../../lib/minio-client";
import { prisma } from "../../lib/prisma-client";
import { isAuth } from "../../plugins/is-auth";

type formats = "jpeg" | "webp" | "avif";

const uploadSchema = t.Object({ image: t.File({ format: "image/*" }) });

export const uploadProductsPhotoRoutes = new Elysia().use(isAuth).post(
  "/upload-photo/:id",
  async ({ body, user, params }) => {
    const { image } = body;
    const productId = params.id;
    const arrayBuffer = await image.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      throw new ApiError("Product not found", 404);
    }

    if (!product.userId || product.userId !== user.id) {
      throw new ApiError("Access denied", 403);
    }

    const basePath = `products/${productId}`;

    const sizes: { name: MediaType; resize: number }[] = [
      { name: "preview", resize: 200 },
      { name: "thumb", resize: 800 },
    ];

    const formats: formats[] = ["jpeg", "webp", "avif"];

    const createdMedia = await prisma.media.create({
      data: {
        productId: Number(productId),
      },
    });

    for (const size of sizes) {
      const baseImage = sharp(buffer).rotate().resize(size.resize);

      for (const format of formats) {
        const processed = await baseImage
          .clone()
          [format]({ quality: 80 })
          .toBuffer();

        const filename = `${basePath}/${Math.floor(Date.now() / 1000)}-${size.name}.${format}`;

        await minio.write(filename, processed);

        await prisma.mediaVersion.create({
          data: {
            mediaId: createdMedia.id,
            type: size.name,
            format,
            link: filename,
          },
        });
      }
    }

    return {
      message: "OK",
    };
  },
  {
    body: uploadSchema,
    detail: {
      tags: ["Shop"],
      security: [{ bearerAuth: [] }],
      requestBody: {
        description: "Upload a product photo",
        content: {
          "multipart/form-data": {
            schema: uploadSchema,
          },
        },
      },
    },
  },
);
