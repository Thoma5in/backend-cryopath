import redis from 'redis';

const REDIS_ENABLED = (process.env.REDIS_ENABLED ?? 'true').toLowerCase() !== 'false';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number.parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_CONNECT_TIMEOUT_MS = Number.parseInt(process.env.REDIS_CONNECT_TIMEOUT_MS || '3000', 10);
const REDIS_RETRY_COOLDOWN_MS = Number.parseInt(process.env.REDIS_RETRY_COOLDOWN_MS || '30000', 10);

let isConnecting = false;
let nextRetryAt = 0;
let hasLoggedUnavailable = false;

function describeRedisError(err) {
  if (!err) {
    return 'Error desconocido';
  }

  if (typeof err.message === 'string' && err.message.trim()) {
    return err.message.trim();
  }

  if (Array.isArray(err.errors) && err.errors.length > 0) {
    const firstError = err.errors[0];
    if (firstError?.message) {
      return firstError.message;
    }
    if (firstError?.code) {
      return firstError.code;
    }
  }

  if (err.code) {
    return err.code;
  }

  return String(err);
}

const redisClient = REDIS_ENABLED
  ? redis.createClient({
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
        reconnectStrategy: () => false,
      },
    })
  : null;

if (!REDIS_ENABLED) {
  console.warn('Redis: Cache deshabilitado (REDIS_ENABLED=false)');
}

if (redisClient) {
  redisClient.on('error', (err) => {
    console.error(`Redis error: ${describeRedisError(err)}`);
  });

  redisClient.on('connect', () => {
    if (hasLoggedUnavailable) {
      console.log('Redis: Conexión restablecida, cache activa');
      hasLoggedUnavailable = false;
    } else {
      console.log('Redis: Connected');
    }
  });

  redisClient.on('end', () => {
    console.warn('Redis: Conexión cerrada');
  });
}

function logRedisUnavailable(err) {
  if (hasLoggedUnavailable) {
    return;
  }

  hasLoggedUnavailable = true;
  const errorMessage = describeRedisError(err);
  console.warn(
    `Redis no disponible en ${REDIS_HOST}:${REDIS_PORT} (${errorMessage}). ` +
      'Se continuará sin cache por ahora.'
  );
}

export async function ensureRedisConnection() {
  if (!redisClient) {
    return false;
  }

  if (redisClient.isReady) {
    return true;
  }

  if (isConnecting || Date.now() < nextRetryAt) {
    return false;
  }

  isConnecting = true;
  try {
    await redisClient.connect();
    nextRetryAt = 0;
    return redisClient.isReady;
  } catch (err) {
    nextRetryAt = Date.now() + REDIS_RETRY_COOLDOWN_MS;
    logRedisUnavailable(err);
    return false;
  } finally {
    isConnecting = false;
  }
}

export default redisClient;
