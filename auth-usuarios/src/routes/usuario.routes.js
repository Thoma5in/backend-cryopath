import { Router } from 'express';
import { getCurrentUsuario, reactivateAccount } from '../controllers/usuario.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { updateUsuario } from '../controllers/usuario.controller.js';
import { deleteUsuario } from '../controllers/usuario.controller.js';
import { checkEmailStatus } from '../controllers/usuario.controller.js';
import { getUserRoles } from '../controllers/usuario.controller.js';


const router = Router();

router.get('/me', requireAuth, getCurrentUsuario);
router.put('/', requireAuth, updateUsuario)
router.delete('/me', requireAuth, deleteUsuario)
router.post('/check-email', checkEmailStatus);
router.put('/reactivate', reactivateAccount)
router.get('/roles', requireAuth, getUserRoles);


export default router;
