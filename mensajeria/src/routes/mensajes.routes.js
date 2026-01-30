import { Router } from 'express';
import { enviarMensaje } from '../controllers/mensajes.controller.js';
import { requireAuth } from '../../../auth-usuarios/src/middlewares/auth.middleware.js';


const router = Router();



export default router;