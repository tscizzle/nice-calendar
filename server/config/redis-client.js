const redis = require("redis");

const REDIS_CONNECTION_STRING =
  process.env.REDIS_URL || "redis://localhost:6379/1";
const client = redis.createClient(REDIS_CONNECTION_STRING);

// Print to console when connected or disconnected.
client.on("connect", () => console.info("Redis connected."));
client.on("error", (err) => console.info(`Redis errored: ${err}.`));

module.exports = client;
