import { Router } from "express";
import { crearProducto } from "../controllers/producto.controller.js";
import { obtenerProductos } from "../controllers/producto.controller.js";
import { editarProducto } from "../controllers/producto.controller.js";
import { requireWorkerOrAdmin } from "../../../auth-usuarios/src/middlewares/worker.middleware.js";

const router = Router();

// Endpoint para crear un nuevo producto
router.post("/", requireWorkerOrAdmin, crearProducto);
// Endpoint para obtener todos los productos
router.get("/", obtenerProductos);
// Endpoint para editar un producto existente
router.put("/:id_producto", requireWorkerOrAdmin, editarProducto);


export default router;

