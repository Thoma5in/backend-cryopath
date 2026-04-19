import { Router } from "express";
import {
  crearPedido,
  obtenerPedidosPorUsuario,
  obtenerPedido,
  actualizarEstadoPedido,
  eliminarPedido,
  listarTodosPedidos,
} from "../controllers/pedidos.controller.js";

const router = Router();

/**
 * ===========================
 * RUTAS DE PEDIDOS
 * ===========================
 * Base URL: /pedidos
 *
 * Este módulo de rutas maneja todas las operaciones relacionadas con
 * la creación, lectura, actualización y eliminación de pedidos en el sistema.
 *
 * Estados de pedido disponibles:
 * - PENDIENTE: Pedido creado pero no confirmado
 * - CONFIRMADO: Pedido confirmado y listo para procesar
 * - ENVIADO: Pedido enviado al usuario
 * - ENTREGADO: Pedido entregado al usuario
 * - CANCELADO: Pedido cancelado
 */

/**
 * POST /pedidos
 * Crear un nuevo pedido
 * 
 * Body requerido:
 * {
 *   userId: string (UUID del usuario),
 *   items: [
 *     {
 *       productoId: number,
 *       cantidad: number,
 *       precio: number
 *     }
 *   ],
 *   total: number
 * }
 */
router.post("/", crearPedido);

/**
 * GET /pedidos/usuario/:userId
 * Obtener todos los pedidos de un usuario
 * 
 * Params:
 * - userId: string (UUID del usuario)
 * 
 * Retorna array de pedidos ordenados por fecha (más reciente primero)
 * incluye detalles de productos
 */
router.get("/usuario/:userId", obtenerPedidosPorUsuario);

/**
 * GET /pedidos/:id
 * Obtener un pedido específico con detalles completos
 * 
 * Params:
 * - id: number (ID del pedido)
 * 
 * Retorna información completa del pedido incluyendo
 * imágenes de productos y detalles de cada item
 */
router.get("/:id", obtenerPedido);

/**
 * PUT /pedidos/:id
 * Actualizar el estado de un pedido
 * 
 * Params:
 * - id: number (ID del pedido)
 * 
 * Body requerido:
 * {
 *   estado: string (PENDIENTE | CONFIRMADO | ENVIADO | ENTREGADO | CANCELADO)
 * }
 */
router.put("/:id", actualizarEstadoPedido);

/**
 * DELETE /pedidos/:id
 * Eliminar un pedido y sus detalles asociados
 * 
 * Params:
 * - id: number (ID del pedido)
 * 
 * Nota: Se eliminan en cascada los detalles del pedido
 */
router.delete("/:id", eliminarPedido);

/**
 * GET /pedidos
 * Listar todos los pedidos del sistema (Admin)
 * 
 * Query params:
 * - estado: string (opcional) - Filtrar por estado
 * - limit: number (default: 50) - Número de registros por página
 * - offset: number (default: 0) - Número de registros a saltar
 * 
 * Ejemplo: GET /pedidos?estado=PENDIENTE&limit=20&offset=0
 * Retorna primeros 20 pedidos pendientes
 */
router.get("/", listarTodosPedidos);

export default router;
