// redisClient.js
import { createClient } from "redis";

const redis = createClient({ url:  process.env.REDIS_URL });
await redis.connect();
console.log("connected redis");

export default redis;
