import { Router } from 'express';
import { getCurrentUsuario } from '../controllers/usuario.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { updateUsuario } from '../controllers/usuario.controller.js';

const router = Router();

router.get('/me', requireAuth, getCurrentUsuario);
router.put('/', requireAuth, updateUsuario)

export default router;
