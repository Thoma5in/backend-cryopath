import { Router } from "express";
import { crearProducto } from "../controllers/producto.controller.js";

const router = Router();

// Endpoint para crear un nuevo producto
router.post("/", crearProducto);

export default router;

