import {Router} from 'express';
import {listarNotificaciones, marcarNotificacionLeida, marcarTodasLeidas} from '../controllers/notificaciones.controller.js';
import {requireAuth} from '../../../auth-usuarios/src/middlewares/auth.middleware.js';  

const router = Router();

router.get('/', requireAuth, listarNotificaciones);
router.patch('/:id/leida', requireAuth, marcarNotificacionLeida);
router.patch('/marcar-todas', requireAuth, marcarTodasLeidas);

export default router;