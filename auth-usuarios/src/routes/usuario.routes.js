import { Router } from 'express';
import { getCurrentUsuario } from '../controllers/usuario.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/me', requireAuth, getCurrentUsuario);

export default router;
