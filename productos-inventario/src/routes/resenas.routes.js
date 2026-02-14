import { Router } from "express";
import {
	crearResena,
	obtenerResenasPorProducto,
	obtenerPromedioProducto,
	editarResena,
	eliminarResena,
	obtenerResenasPorUsuario
} from "../controllers/resenas.controller.js";

const router = Router();

// POST /api/resenas - Crear reseña
router.post("/", crearResena);

// GET /api/resenas/producto/:id_producto - Obtener reseñas de un producto
router.get("/producto/:id_producto", obtenerResenasPorProducto);

// GET /api/resenas/producto/:id_producto/promedio - Obtener solo el promedio
router.get("/producto/:id_producto/promedio", obtenerPromedioProducto);

// GET /api/resenas/usuario/:id_usuario - Obtener reseñas de un usuario
router.get("/usuario/:id_usuario", obtenerResenasPorUsuario);

// PUT /api/resenas/:id_resena - Editar reseña
router.put("/:id_resena", editarResena);

// DELETE /api/resenas/:id_resena - Eliminar reseña
router.delete("/:id_resena", eliminarResena);

export default router;
