import { Router } from "express";
import {
  getInventario,
  getInventarioByProducto,
  createInventario,
  updateInventario,
} from "../controllers/inventario.controller.js";

const router = Router();

router.get("/", getInventario);
router.get("/producto/:id_producto", getInventarioByProducto);
router.post("/", createInventario);
router.put("/producto/:id_producto", updateInventario);

export default router;
