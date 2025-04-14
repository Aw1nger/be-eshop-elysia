import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: Bun.env.REDIS_HOST || "localhost",
    port: Number(Bun.env.REDIS_PORT) || 6379,
  },
  password: Bun.env.REDIS_PASSWORD || undefined,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

await redisClient.connect();

export { redisClient };
