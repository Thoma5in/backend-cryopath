import {Router} from 'express';
import { crearDireccion, obtenerDirecciones } from '../controllers/direccion.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();   

router.post('/', requireAuth, crearDireccion);
router.get('/', requireAuth, obtenerDirecciones);

export default router;