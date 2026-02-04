import { Router } from 'express';
import { obtenerPromociones, crearPromociondeCategoria, obtenerPromocionesConCategorias } from '../controllers/promociones.controller.js';

const router = Router();

// Endpoint para obtener todas las promociones
router.get('/', obtenerPromociones);

// Endpoint para obtener promociones con sus categorías asociadas
router.get('/con-categorias', obtenerPromocionesConCategorias);

// Endpoint para crear una nueva promoción con categorías
router.post('/', crearPromociondeCategoria);

export default router;