import { Router } from 'express';
import {
	obtenerPromociones,
	crearPromociondeCategoria,
	obtenerPromocionesConCategorias,
	obtenerPromocionesConProductos,
	crearPromocionDeProducto
} from '../controllers/promociones.controller.js';

const router = Router();

// Endpoint para obtener todas las promociones
router.get('/', obtenerPromociones);

// Endpoint para obtener promociones con sus categorías asociadas
router.get('/con-categorias', obtenerPromocionesConCategorias);

// Endpoint para obtener promociones con sus productos asociados
router.get('/con-productos', obtenerPromocionesConProductos);

// Endpoint para crear una nueva promoción con categorías
router.post('/', crearPromociondeCategoria);

// Endpoint para crear una nueva promoción con productos
router.post('/productos', crearPromocionDeProducto);

export default router;