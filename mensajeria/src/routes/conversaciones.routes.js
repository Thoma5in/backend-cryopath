import {Router} from 'express';
import { crearConversacion } from '../controllers/conversaciones.controller.js';
import {listarConversaciones} from '../controllers/conversaciones.controller.js';
import {obtenerConversacion} from '../controllers/conversaciones.controller.js';
import {marcarMensajesLeidos} from '../controllers/conversaciones.controller.js';
import {contarNoLeidos} from '../controllers/conversaciones.controller.js';
import { enviarMensaje } from '../controllers/mensajes.controller.js';
import { requireAuth } from '../../../auth-usuarios/src/middlewares/auth.middleware.js';

const router = Router();

router.post('/', requireAuth, crearConversacion);
router.get('/', requireAuth, listarConversaciones);
router.get('/:id', requireAuth, obtenerConversacion);
router.post('/:id/leido', requireAuth, marcarMensajesLeidos);
router.get('/no-leidos', requireAuth, contarNoLeidos)
router.post(
  '/:id/mensajes',
  requireAuth,
  enviarMensaje
);

export default router;