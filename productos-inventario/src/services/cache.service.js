import redisClient, { ensureRedisConnection } from '../config/redis.js';

// Configuración de TTL por tipo de dato (en segundos)
const TTL_CONFIG = {
  categorias: 3600, // 1 hora
  supercategorias: 3600, // 1 hora
  productos_relacionados: 1800, // 30 minutos
  productos: 1800, // 30 minutos
  producto_categoria: 900, // 15 minutos
  inventario: 600, // 10 minutos
  busqueda: 300, // 5 minutos
};

/**
 * Obtener valor del caché
 * @param {string} key - Clave del caché
 * @returns {Promise<any>} - Valor parseado o null si no existe
 */
async function getCached(key) {
  try {
    await ensureRedisConnection();
    const value = await redisClient.get(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (err) {
    console.error(`Cache error getting ${key}:`, err);
    return null;
  }
}

/**
 * Guardar valor en caché
 * @param {string} key - Clave del caché
 * @param {any} value - Valor a guardar (se serializa a JSON)
 * @param {string} type - Tipo de dato para determinar TTL
 * @returns {Promise<void>}
 */
async function setCached(key, value, type = 'default') {
  try {
    await ensureRedisConnection();
    const ttl = TTL_CONFIG[type] || 600;
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error(`Cache error setting ${key}:`, err);
  }
}

/**
 * Eliminar clave del caché
 * @param {string} key - Clave del caché
 * @returns {Promise<void>}
 */
async function invalidateCache(key) {
  try {
    await ensureRedisConnection();
    await redisClient.del(key);
  } catch (err) {
    console.error(`Cache error invalidating ${key}:`, err);
  }
}

/**
 * Eliminar múltiples claves con patrón (pattern matching)
 * @param {string} pattern - Patrón glob (ej: "productos:*")
 * @returns {Promise<number>} - Número de claves eliminadas
 */
async function invalidatePattern(pattern) {
  try {
    await ensureRedisConnection();
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return keys.length;
  } catch (err) {
    console.error(`Cache error invalidating pattern ${pattern}:`, err);
    return 0;
  }
}

/**
 * Limpiar todo el caché (usar con cuidado)
 * @returns {Promise<void>}
 */
async function flushCache() {
  try {
    await ensureRedisConnection();
    await redisClient.flushDb();
    console.log('Cache: All data cleared');
  } catch (err) {
    console.error('Cache error flushing:', err);
  }
}

/**
 * Invalidar cache de productos (todas las claves que empiezan con "productos:")
 * @returns {Promise<number>} - Número de claves eliminadas
 */
async function invalidateProductosCache() {
  const keysInvalidated = await invalidatePattern("productos:*");
  console.log(`🗑️ Cache productos invalidado - ${keysInvalidated} claves eliminadas`);
  return keysInvalidated;
}

/**
 * Invalidar cache de relaciones producto-categoria
 * @param {string|number} id_producto - ID del producto
 * @param {string|number} id_categoria - ID de la categoría (opcional)
 * @param {string|number} id_categoria_anterior - ID de la categoría anterior (opcional, para updates)
 * @returns {Promise<void>}
 */
async function invalidateProductoCategoriaCache({ id_producto, id_categoria, id_categoria_anterior }) {
  const promises = [];

  if (id_producto) {
    promises.push(invalidateCache(`producto:categoria:${id_producto}`));
  }

  if (id_categoria) {
    promises.push(invalidateCache(`categoria:productos:${id_categoria}`));
  }

  if (id_categoria_anterior) {
    promises.push(invalidateCache(`categoria:productos:${id_categoria_anterior}`));
  }

  await Promise.all(promises);
  
  console.log(`🗑️ Cache producto-categoria invalidado - producto: ${id_producto}, categoria: ${id_categoria}${id_categoria_anterior ? `, anterior: ${id_categoria_anterior}` : ''}`);
}

export {
  getCached,
  setCached,
  invalidateCache,
  invalidatePattern,
  flushCache,
  invalidateProductosCache,
  invalidateProductoCategoriaCache,
  TTL_CONFIG,
};
