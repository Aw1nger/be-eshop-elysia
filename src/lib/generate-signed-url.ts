import { minio } from "./minio-client";

export const generateSignedUrl = async (
  path: string,
  expiresIn: number = 3600,
) => {
  const url = minio.presign(path, {
    acl: "public-read",
    method: "GET",
    expiresIn,
    endpoint: Bun.env.MINIO_OUTPUT,
  });

  return url;
};
