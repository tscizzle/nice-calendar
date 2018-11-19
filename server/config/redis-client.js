const redis = require('redis');

const REDIS_CONNECTION_STRING =
  process.env.REDIS_URL || 'redis://localhost:6379/1';
const client = redis.createClient(REDIS_CONNECTION_STRING);

module.exports = client;
