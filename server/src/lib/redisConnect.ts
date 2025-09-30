import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient>;

export const ConnectRedis = async () => {
  redisClient = createClient({
    url: process.env.REDIS_URL,
  });
  try {
    await redisClient.connect();
    console.log("🚀 Redis connected and ready!");
  } catch (error) {
    console.error("❌ Redis connect failed:", error);
  }
};

export { redisClient };
