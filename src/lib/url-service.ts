import { getSignedUrlFromCache, setSignedUrlToCache } from "./cache";
import { generateSignedUrl } from "./generate-signed-url";

const URL_EXPIRATION = parseInt(process.env.URL_EXPIRATION_SECONDS || "3600");

export const getOrCreateSignedUrl = async (path: string) => {
  const cacheKey = `signed-url:${path}`;

  let signedUrl = await getSignedUrlFromCache(cacheKey);

  if (signedUrl) {
    console.log(`[CACHE HIT] for ${path}`);
    return signedUrl;
  }

  console.log(`[CACHE MISS] Generating new signed URL for ${path}`);
  signedUrl = await generateSignedUrl(path);

  await setSignedUrlToCache(cacheKey, signedUrl, URL_EXPIRATION - 60);

  return signedUrl;
};
