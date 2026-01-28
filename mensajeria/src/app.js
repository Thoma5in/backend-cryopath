import conversacionesRoutes from './routes/conversaciones.routes.js';
import mensajesRoutes from './routes/mensajes.routes.js';
import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mensajeria' })
})

app.use('/', conversacionesRoutes)
app.use('/conversaciones', conversacionesRoutes)
app.use('/conversaciones/:id', conversacionesRoutes)
app.use('/mensajes', mensajesRoutes);
app.use('/mensajes', mensajesRoutes);

export default app;