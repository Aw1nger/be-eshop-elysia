import { minio } from "./minio-client";

export const generateSignedUrl = async (path: string) => {
  const url = minio.presign(path, {
    acl: "public-read",
    method: "GET",
    expiresIn: 3600,
    endpoint: Bun.env.MINIO_OUTPUT,
  });

  return url;
};
