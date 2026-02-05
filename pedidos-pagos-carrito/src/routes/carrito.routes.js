import { Router } from "express";
import {
  getCart,
  addToCart,
  updateQuantity,
  deleteItem,
  clearCart,
  getCartByCategory
} from "../controllers/carrito.controller.js";

const router = Router();

/**
 * BASE: /cart
 */

// Obtener carrito por usuario
router.get("/:userId", getCart);

// Obtener carrito agrupado por categoría
router.get("/:userId/categorias", getCartByCategory);

// Agregar item al carrito
router.post("/:userId/items", addToCart);

// Actualizar cantidad de un item
router.put("/:userId/items/:itemId", updateQuantity);

// Eliminar un item del carrito
router.delete("/:userId/items/:itemId", deleteItem);

// Vaciar carrito completo
router.delete("/:userId", clearCart);

export default router;
