import { supabase } from "../config/supabase.js";

/**
 * @route       POST /pedidos
 * @method      POST
 * @description Crea un nuevo pedido con sus detalles asociados
 * @access      Public
 *
 * @param {Object} req.body - Body de la solicitud
 * @param {string} req.body.userId - ID del usuario que hace el pedido
 * @param {Array} req.body.items - Array de items del pedido
 * @param {number} req.body.items[].productoId - ID del producto
 * @param {number} req.body.items[].cantidad - Cantidad del producto
 * @param {number} req.body.items[].precio - Precio unitario del producto
 * @param {number} req.body.total - Total del pedido
 *
 * @returns {Object} 201 - Pedido creado exitosamente
 * @returns {boolean} success - Estado de la operación
 * @returns {number} id_pedido - ID del nuevo pedido
 * @returns {string} message - Mensaje confirmativo
 *
 * @returns {Object} 400 - Faltan datos requeridos
 * @returns {Object} 500 - Error al procesar el pedido
 */
export const crearPedido = async (req, res) => {
  try {
    const { userId, items, total } = req.body;

    if (!userId || !items || items.length === 0 || !total) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos requeridos (userId, items, total)",
      });
    }

    // Crear pedido en BD
    const { data: nuevoPedido, error: pedidoError } = await supabase
      .from("pedido")
      .insert({
        id_usuario: userId,
        total,
        estado: "PENDIENTE",
      })
      .select()
      .single();

    if (pedidoError) {
      console.error("Error al crear pedido:", pedidoError);
      return res
        .status(500)
        .json({ success: false, message: "Error al crear el pedido" });
    }

    // Insertar detalles del pedido
    const detalles = items.map((item) => ({
      id_pedido: nuevoPedido.id_pedido,
      id_producto: item.productoId,
      cantidad: item.cantidad,
      precio_unitario: item.precio,
    }));

    const { error: detallesError } = await supabase
      .from("pedido_detalle")
      .insert(detalles);

    if (detallesError) {
      console.error("Error al crear detalles del pedido:", detallesError);
      return res.status(500).json({
        success: false,
        message: "Error al crear los detalles del pedido",
      });
    }

    return res.status(201).json({
      success: true,
      id_pedido: nuevoPedido.id_pedido,
      message: "Pedido creado exitosamente",
    });
  } catch (error) {
    console.error("Error al procesar el pedido:", error);
    res.status(500).json({ success: false, message: "Error al procesar el pedido" });
  }
};

/**
 * @route       GET /pedidos/usuario/:userId
 * @method      GET
 * @description Obtiene todos los pedidos de un usuario específico
 * @access      Public
 *
 * @param {string} req.params.userId - ID del usuario (requerido)
 *
 * @returns {Object} 200 - Lista de pedidos obtenida exitosamente
 * @returns {boolean} success - Estado de la operación
 * @returns {number} total - Total de pedidos encontrados
 * @returns {Array} data - Array de pedidos con detalles y productos
 *
 * @returns {Object} 400 - El userId es requerido
 * @returns {Object} 500 - Error al obtener los pedidos
 */
export const obtenerPedidosPorUsuario = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "El userId es requerido",
      });
    }

    const { data: pedidos, error } = await supabase
      .from("pedido")
      .select(
        `
        id_pedido,
        fecha_creacion,
        estado,
        total,
        id_usuario,
        pedido_detalle (
          id_producto,
          cantidad,
          precio_unitario,
          producto (
            id_producto,
            nombre,
            descripcion,
            precio_base
          )
        )
      `
      )
      .eq("id_usuario", userId)
      .order("fecha_creacion", { ascending: false });

    if (error) {
      console.error("Error al obtener pedidos:", error);
      return res.status(500).json({
        success: false,
        message: "Error al obtener los pedidos",
      });
    }

    return res.json({
      success: true,
      total: pedidos.length,
      data: pedidos,
    });
  } catch (error) {
    console.error("Error en obtenerPedidosPorUsuario:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

/**
 * @route       GET /pedidos/:id
 * @method      GET
 * @description Obtiene un pedido específico con todos sus detalles e imágenes de productos
 * @access      Public
 *
 * @param {string} req.params.id - ID del pedido (requerido)
 *
 * @returns {Object} 200 - Pedido obtenido exitosamente
 * @returns {boolean} success - Estado de la operación
 * @returns {Object} data - Objeto del pedido con detalles completos
 * @returns {number} data.id_pedido - ID del pedido
 * @returns {string} data.fecha_creacion - Fecha de creación del pedido
 * @returns {string} data.estado - Estado actual del pedido
 * @returns {number} data.total - Total del pedido
 * @returns {string} data.id_usuario - ID del usuario propietario
 * @returns {Array} data.pedido_detalle - Array de items del pedido con productos
 *
 * @returns {Object} 400 - El id del pedido es requerido
 * @returns {Object} 404 - Pedido no encontrado
 * @returns {Object} 500 - Error interno del servidor
 */
export const obtenerPedido = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "El id del pedido es requerido",
      });
    }

    const { data: pedido, error } = await supabase
      .from("pedido")
      .select(
        `
        id_pedido,
        fecha_creacion,
        estado,
        total,
        id_usuario,
        pedido_detalle (
          id_producto,
          cantidad,
          precio_unitario,
          producto (
            id_producto,
            nombre,
            descripcion,
            precio_base,
            producto_imagen (
              id_imagen,
              url
            )
          )
        )
      `
      )
      .eq("id_pedido", id)
      .single();

    if (error) {
      console.error("Error al obtener pedido:", error);
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
      });
    }

    return res.json({
      success: true,
      data: pedido,
    });
  } catch (error) {
    console.error("Error en obtenerPedido:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

/**
 * @route       PUT /pedidos/:id
 * @method      PUT
 * @description Actualiza el estado de un pedido existente
 * @access      Public
 *
 * @param {string} req.params.id - ID del pedido (requerido)
 * @param {Object} req.body - Body de la solicitud
 * @param {string} req.body.estado - Nuevo estado del pedido (requerido)
 *   Estados válidos: PENDIENTE, CONFIRMADO, ENVIADO, ENTREGADO, CANCELADO
 *
 * @returns {Object} 200 - Estado del pedido actualizado exitosamente
 * @returns {boolean} success - Estado de la operación
 * @returns {string} message - Mensaje confirmativo
 * @returns {Object} data - Objeto del pedido actualizado
 *
 * @returns {Object} 400 - Datos requeridos faltantes o estado inválido
 * @returns {Object} 404 - Pedido no encontrado
 * @returns {Object} 500 - Error al actualizar el pedido
 */
export const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "El id del pedido es requerido",
      });
    }

    if (!estado) {
      return res.status(400).json({
        success: false,
        message: "El estado es requerido",
      });
    }

    const estadosValidos = ["PENDIENTE", "CONFIRMADO", "ENVIADO", "ENTREGADO", "CANCELADO"];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Estados válidos: ${estadosValidos.join(", ")}`,
      });
    }

    const { data: pedidoActualizado, error } = await supabase
      .from("pedido")
      .update({ estado })
      .eq("id_pedido", id)
      .select()
      .single();

    if (error) {
      console.error("Error al actualizar pedido:", error);
      return res.status(500).json({
        success: false,
        message: "Error al actualizar el estado del pedido",
      });
    }

    if (!pedidoActualizado) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
      });
    }

    return res.json({
      success: true,
      message: "Estado del pedido actualizado exitosamente",
      data: pedidoActualizado,
    });
  } catch (error) {
    console.error("Error en actualizarEstadoPedido:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

/**
 * @route       DELETE /pedidos/:id
 * @method      DELETE
 * @description Elimina un pedido y sus detalles asociados de la base de datos
 * @access      Public
 *
 * @param {string} req.params.id - ID del pedido a eliminar (requerido)
 *
 * @returns {Object} 200 - Pedido eliminado exitosamente
 * @returns {boolean} success - Estado de la operación
 * @returns {string} message - Mensaje confirmativo
 *
 * @returns {Object} 400 - El id del pedido es requerido
 * @returns {Object} 404 - Pedido no encontrado
 * @returns {Object} 500 - Error al eliminar el pedido o sus detalles
 *
 * @note Se eliminan primero los detalles del pedido y posteriormente el pedido
 */
export const eliminarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "El id del pedido es requerido",
      });
    }

    // Primero eliminar los detalles del pedido
    const { error: detallesError } = await supabase
      .from("pedido_detalle")
      .delete()
      .eq("id_pedido", id);

    if (detallesError) {
      console.error("Error al eliminar detalles del pedido:", detallesError);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar los detalles del pedido",
      });
    }

    // Luego eliminar el pedido
    const { data: pedidoEliminado, error: pedidoError } = await supabase
      .from("pedido")
      .delete()
      .eq("id_pedido", id)
      .select()
      .single();

    if (pedidoError) {
      console.error("Error al eliminar pedido:", pedidoError);
      return res.status(500).json({
        success: false,
        message: "Error al eliminar el pedido",
      });
    }

    if (!pedidoEliminado) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
      });
    }

    return res.json({
      success: true,
      message: "Pedido eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error en eliminarPedido:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};

/**
 * @route       GET /pedidos
 * @method      GET
 * @description Lista todos los pedidos del sistema con soporte para filtrado y paginación (Admin)
 * @access      Admin
 *
 * @query {string} [estado] - Filtrar por estado (opcional)
 *   Estados válidos: PENDIENTE, CONFIRMADO, ENVIADO, ENTREGADO, CANCELADO
 * @query {number} [limit=50] - Número de registros por página (default: 50)
 * @query {number} [offset=0] - Número de registros a saltar (default: 0)
 *
 * @returns {Object} 200 - Lista de pedidos obtenida exitosamente
 * @returns {boolean} success - Estado de la operación
 * @returns {number} total - Total de registros encontrados
 * @returns {number} limit - Número de registros retornados
 * @returns {number} offset - Número de registros saltados
 * @returns {Array} data - Array de pedidos con sus detalles
 *
 * @returns {Object} 500 - Error al listar los pedidos
 *
 * @example
 * GET /pedidos?estado=PENDIENTE&limit=20&offset=0
 * Obtiene los primeros 20 pedidos con estado PENDIENTE
 */
export const listarTodosPedidos = async (req, res) => {
  try {
    const { estado, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from("pedido")
      .select(
        `
        id_pedido,
        fecha_creacion,
        estado,
        total,
        id_usuario,
        pedido_detalle (
          id_producto,
          cantidad,
          precio_unitario
        )
      `,
        { count: "exact" }
      )
      .range(offset, offset + limit - 1)
      .order("fecha_creacion", { ascending: false });

    if (estado) {
      query = query.eq("estado", estado);
    }

    const { data: pedidos, error, count } = await query;

    if (error) {
      console.error("Error al listar pedidos:", error);
      return res.status(500).json({
        success: false,
        message: "Error al listar los pedidos",
      });
    }

    return res.json({
      success: true,
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      data: pedidos,
    });
  } catch (error) {
    console.error("Error en listarTodosPedidos:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
};
