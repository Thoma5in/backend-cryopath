import { Router } from "express";
import multer from "multer";
import { uploadImagenProducto, eliminarImagenesProducto } from "../controllers/storageProductos.controller.js";
import { obtenerImagenProducto, obtenerImagenesProducto } from "../controllers/producto.controller.js";
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

// Endpoint para obtener todas las imágenes de un producto
router.get(
  "/:id_producto/imagenes",
  obtenerImagenesProducto
);

// Endpoint para eliminar todas las imágenes de un producto
router.delete(
  "/:id_producto/imagenes",
  requireWorkerOrAdmin,
  eliminarImagenesProducto
);

export default router;
