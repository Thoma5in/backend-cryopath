import { Router } from "express";
import {
  getCart,
  addToCart,
  updateQuantity,
  deleteItem,
  clearCart
} from "../controllers/carrito.controller.js";

const router = Router();

/**
 * BASE: /cart
 */

// Obtener carrito por usuario
router.get("/:userId", getCart);

// Agregar item al carrito
router.post("/:userId/items", addToCart);

// Actualizar cantidad de un item
router.put("/:userId/items/:itemId", updateQuantity);

// Eliminar un item del carrito
router.delete("/:userId/items/:itemId", deleteItem);

// Vaciar carrito completo
router.delete("/:userId", clearCart);

export default router;
