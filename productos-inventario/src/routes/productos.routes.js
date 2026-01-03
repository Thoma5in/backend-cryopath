import { Router } from "express";
import { crearProducto } from "../controllers/producto.controller.js";
import { obtenerProductos } from "../controllers/producto.controller.js";

const router = Router();

// Endpoint para crear un nuevo producto
router.post("/", crearProducto);
// Endpoint para obtener todos los productos
router.get("/", obtenerProductos);


export default router;

