import { Router } from "express";
import { obtenerTotalVentasVendedor } from "../controllers/vendedor.controller.js";

const router = Router();

/**
 * GET /vendedor/:userId/total-ventas
 * Obtiene el total consolidado de ventas pagadas para un vendedor.
 */
router.get("/:userId/total-ventas", obtenerTotalVentasVendedor);

export default router;
