import { Router } from 'express';
import { obtenerPromociones, crearPromociondeCategoria } from '../controllers/promociones.controller.js';

const router = Router();

// Endpoint para obtener todas las promociones
router.get('/', obtenerPromociones);

// Endpoint para crear una nueva promoción con categorías
router.post('/', crearPromociondeCategoria);

export default router;