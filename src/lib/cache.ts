import { redisClient } from "./redis-client";

const getSignedUrlFromCache = async (key: string) => {
  const url = await redisClient.get(key);
  return url;
};

const setSignedUrlToCache = async (
  key: string,
  url: string,
  expiration: number,
) => {
  await redisClient.set(key, url, {
    EX: expiration,
  });
};

export { getSignedUrlFromCache, setSignedUrlToCache };
