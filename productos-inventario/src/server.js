import dotenv from 'dotenv';

// Cargar variables de entorno PRIMERO, antes de cualquier otra importación
dotenv.config();

import app from './app.js';
import { ensureRedisConnection } from './config/redis.js';

const PORT = process.env.PORT || 3002;

// Conectar a Redis antes de iniciar el servidor
(async () => {
  try {
    await ensureRedisConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Microservicio Productos-Inventario corriendo en puerto ${PORT}`);
    });
  } catch (err) {
    console.error('Error initializing server:', err);
    process.exit(1);
  }
})();