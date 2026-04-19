import 'dotenv/config';

import app from './app.js';

const PORT = process.env.PORT || 3002;

try {
  app.listen(PORT, () => {
    console.log(`🚀 Microservicio Productos-Inventario corriendo en puerto ${PORT}`);
  });
} catch (err) {
  console.error('Error initializing server:', err);
  process.exit(1);
}
