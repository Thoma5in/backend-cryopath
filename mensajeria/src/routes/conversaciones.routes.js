import {Router} from 'express';
import { crearConversacion } from '../controllers/conversaciones.controller.js';
import {listarConversaciones} from '../controllers/conversaciones.controller.js';
import {obtenerConversacion} from '../controllers/conversaciones.controller.js';
import {marcarMensajesLeidos} from '../controllers/conversaciones.controller.js';
import {contarNoLeidos} from '../controllers/conversaciones.controller.js';
import { requireAuth } from '../../../auth-usuarios/src/middlewares/auth.middleware.js';

const router = Router();

router.post('/', requireAuth, crearConversacion);
router.get('/conversaciones', requireAuth, listarConversaciones);
router.get('/conversaciones/:id', requireAuth, obtenerConversacion);
router.post('/conversaciones/:id/leido', requireAuth, marcarMensajesLeidos);
router.get('/conversaciones/no-leidos', requireAuth, contarNoLeidos)

export default router;