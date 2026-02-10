import express from 'express';
import {
    obtenerCategoriasProducto,
    obtenerProductosPorCategoria
} from '../controllers/producto.categorias.controller.js';

const router = express.Router();

// Obtener categoría de un producto
router.get('/producto/:id_producto/categoria', obtenerCategoriasProducto);

// Obtener productos de una categoría
router.get('/categoria/:id_categoria/productos', obtenerProductosPorCategoria);

export default router;
