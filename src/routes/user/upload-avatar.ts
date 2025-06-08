import { MediaType } from "@prisma/client";
import Elysia, { t } from "elysia";
import sharp from "sharp";
import { minio } from "../../lib/minio-client";
import { prisma } from "../../lib/prisma-client";
import { isAuth } from "../../plugins/is-auth";
import { jwtPlugin } from "../../plugins/jwt";

const uploadSchema = t.Object({ image: t.File({ format: "image/*" }) });

export const uploadAvatarRoutes = new Elysia()
  .use(isAuth)
  .use(jwtPlugin)
  .post(
    "/avatar",
    async ({ user, body }) => {
      const { image } = body;
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const basePath = `users/${user.id}`;

      const size: { name: MediaType; resize: number } = {
        name: "base",
        resize: 512,
      };
      const format: TImageFormats = "webp";

      const baseImage = sharp(buffer).rotate().resize(size.resize);

      const processed = await baseImage
        .clone()
        [format]({ quality: 80 })
        .toBuffer();

      const filename = `${basePath}/${Math.floor(Date.now() / 1000)}-${size.name}.${format}`;

      await minio.write(filename, processed);

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          avatar: filename,
        },
      });

      return {
        message: "OK",
      };
    },
    {
      body: uploadSchema,
      detail: {
        tags: ["User"],
        description: "Метод загрузки аватара пользователя",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          description: "Upload a user photo",
          content: {
            "multipart/form-data": {
              schema: uploadSchema,
            },
          },
        },
      },
    },
  );
