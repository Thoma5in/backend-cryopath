import dotenv from 'dotenv';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`🤖 AI Assistant corriendo en puerto ${PORT}`);
  console.log(`📡 Conectado a n8n `);
});
