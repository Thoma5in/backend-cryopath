import redis from 'redis';

// Crear cliente de Redis (sin conectar automáticamente)
const redisClient = redis.createClient({
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis: Max reconnection attempts reached');
        return new Error('Max reconnection attempts reached');
      }
      return Math.min(retries * 50, 500);
    },
  },
});

// Manejo de eventos de conexión
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis: Connected');
});

redisClient.on('reconnecting', () => {
  console.log('Redis: Reconnecting...');
});

// Conectar de forma lazy (perezosa) cuando se importe
let isConnecting = false;
export async function ensureRedisConnection() {
  if (isConnecting || redisClient.isOpen) {
    return;
  }
  
  isConnecting = true;
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Redis: Failed to connect:', err.message);
    isConnecting = false;
  }
}

export default redisClient;
