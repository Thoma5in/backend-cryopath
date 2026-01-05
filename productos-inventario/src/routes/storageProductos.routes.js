import { Router } from "express";
import multer from "multer";
import { uploadImagenProducto } from "../controllers/storageProductos.controller.js";
import { obtenerImagenProducto } from "../controllers/producto.controller.js";
import { requireWorkerOrAdmin } from "../../../auth-usuarios/src/middlewares/worker.middleware.js";

const router = Router();
const upload = multer();

// Endpoint para subir una imagen de producto al bucket "productos"
router.post(
  "/:id_producto/imagen",
  requireWorkerOrAdmin,
  upload.single("file"),
  uploadImagenProducto
);

// Endpoint para obtener la última imagen de un producto
router.get(
  "/:id_producto/imagen",
  obtenerImagenProducto
);

export default router;
