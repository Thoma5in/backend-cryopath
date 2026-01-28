import { Router } from 'express';
import { enviarMensaje } from '../controllers/mensajes.controller.js';
import { requireAuth } from '../../../auth-usuarios/src/middlewares/auth.middleware.js';


const router = Router();

router.post('/mensajes', requireAuth, enviarMensaje);

export default router;