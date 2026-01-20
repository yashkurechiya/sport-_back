// redisClient.js
import { createClient } from "redis";

const redis = createClient({ url: "redis://localhost:6379" });
redis.connect();

export default redis;
