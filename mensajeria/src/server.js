import dotenv from 'dotenv';
import app from './app.js';


dotenv.config();


const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`Servidor de mensajería escuchando en el puerto ${PORT}`);
})