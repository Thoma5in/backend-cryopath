import { Router } from "express";
import { crearProducto } from "../controllers/producto.controller.js";
import { obtenerProductos } from "../controllers/producto.controller.js";
import { editarProducto } from "../controllers/producto.controller.js";
import { eliminarProducto } from "../controllers/producto.controller.js";
import { buscarProductos } from "../controllers/producto.controller.js";
import {
	obtenerImagenProducto,
	obtenerProductosRelacionados,
} from "../controllers/producto.controller.js";
import { requireWorkerOrAdmin } from "../../../auth-usuarios/src/middlewares/worker.middleware.js";


const router = Router();

// Endpoint para buscar productos por nombre o descripción
router.get("/buscar", buscarProductos);
// Endpoint para crear un nuevo producto
router.post("/", requireWorkerOrAdmin, crearProducto);
// Endpoint para obtener todos los productos
router.get("/", obtenerProductos);
// Endpoint para editar un producto existente
router.put("/:id_producto", requireWorkerOrAdmin, editarProducto);
// Endpoint para eliminar un producto existente
router.delete("/:id_producto", requireWorkerOrAdmin, eliminarProducto);
// Endpoint para obtener la imagen de un producto
router.get("/:id_producto/imagen", obtenerImagenProducto);
// Endpoint para obtener productos relacionados
router.get("/:id_producto/relacionados", obtenerProductosRelacionados);


export default router;

