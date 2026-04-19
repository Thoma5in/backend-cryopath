import redis from 'redis';

const REDIS_ENABLED = process.env.REDIS_ENABLED !== 'false';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const MAX_RECONNECT_ATTEMPTS = parseInt(process.env.REDIS_MAX_RETRIES || '3', 10);
const REDIS_RETRY_COOLDOWN_MS = parseInt(process.env.REDIS_RETRY_COOLDOWN_MS || '60000', 10);

let isConnecting = false;
let isRedisAvailable = REDIS_ENABLED;
let nextRetryAt = 0;
let lastLoggedError = '';

function logRedisErrorOnce(message) {
  if (lastLoggedError === message) {
    return;
  }

  lastLoggedError = message;
  console.error(message);
}

// Crear cliente de Redis (sin conectar automáticamente)
const redisClient = redis.createClient({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    reconnectStrategy: (retries) => {
      if (retries >= MAX_RECONNECT_ATTEMPTS) {
        logRedisErrorOnce('Redis: Max reconnection attempts reached, cache disabled temporarily');
        return new Error('Max reconnection attempts reached');
      }
      return Math.min((retries + 1) * 100, 500);
    },
  },
});

// Manejo de eventos de conexión
redisClient.on('error', (err) => {
  isRedisAvailable = false;
  logRedisErrorOnce(`Redis error: ${err.message}`);
});

redisClient.on('ready', () => {
  isRedisAvailable = true;
  lastLoggedError = '';
  console.log('Redis: Connected');
});

redisClient.on('reconnecting', () => {
  console.log('Redis: Reconnecting...');
});

export async function ensureRedisConnection() {
  if (!REDIS_ENABLED) {
    return false;
  }

  if (redisClient.isReady) {
    isRedisAvailable = true;
    return true;
  }

  if (isConnecting) {
    return false;
  }

  if (Date.now() < nextRetryAt) {
    return false;
  }

  isConnecting = true;
  try {
    await redisClient.connect();
    isRedisAvailable = true;
    nextRetryAt = 0;
    return true;
  } catch (err) {
    isRedisAvailable = false;
    nextRetryAt = Date.now() + REDIS_RETRY_COOLDOWN_MS;
    logRedisErrorOnce(`Redis: Failed to connect to ${REDIS_HOST}:${REDIS_PORT}. Cache disabled for ${REDIS_RETRY_COOLDOWN_MS / 1000}s`);
    return false;
  } finally {
    isConnecting = false;
  }
}

export function isRedisReady() {
  return REDIS_ENABLED && isRedisAvailable && redisClient.isReady;
}

export default redisClient;
