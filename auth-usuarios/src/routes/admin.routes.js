import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/admin.middleware.js';
import { adminDashboard } from '../controllers/admin.controller.js';
import { asignarRol } from '../controllers/admin.controller.js';
import { listarUsuarios } from '../controllers/admin.controller.js';
import { listarRoles } from '../controllers/admin.controller.js';
import { cambiarEstadoUsuario } from '../controllers/admin.controller.js';
import { eliminarUsuario } from '../controllers/admin.controller.js';   


const router = Router();

router.get('/dashboard', requireAuth, requireAdmin, adminDashboard);
router.get('/usuarios', requireAuth, requireAdmin, listarUsuarios);
router.get('/roles', requireAuth, requireAdmin, listarRoles);
router.post('/asignar-rol', requireAuth, requireAdmin, asignarRol);
router.put('/cambiar-estado', requireAuth, requireAdmin, cambiarEstadoUsuario);
router.delete('/usuarios/:id_usuario', requireAuth, requireAdmin, eliminarUsuario);


export default router;