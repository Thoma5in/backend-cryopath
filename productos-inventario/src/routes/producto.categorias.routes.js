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

import {
    obtenerProductos,
    obtenerProductosRelacionados
} from "../controllers/producto.controller.js";

router.get("/productos", obtenerProductos);
router.get("/productos/:id_producto/relacionados", obtenerProductosRelacionados);

export async function obtenerProductosRelacionadosRequest(idProducto) {
    if (!idProducto) {
        throw new Error('idProducto es obligatorio')
    }

    const url = `${BASE_URL}/productos/${idProducto}/relacionados`

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
        const message =
            payload?.message ||
            payload?.error ||
            'No se pudieron obtener los productos relacionados'
        throw new Error(message)
    }

    /**
     * El backend devuelve:
     * { productos: [...] }
     */
    return payload.productos ?? []
}

export default router;
