import { supabase } from "../config/supabase.js";

/**
 * @route       GET /vendedor/:userId/total-ventas
 * @method      GET
 * @description Obtiene el total consolidado de ventas pagadas de un vendedor
 * @access      Public
 *
 * @param {string} req.params.userId - ID del vendedor (UUID)
 *
 * @returns {Object} 200 - Total de ventas calculado exitosamente
 * @returns {Object} 400 - userId faltante
 * @returns {Object} 500 - Error interno al consultar datos
 */
export const obtenerTotalVentasVendedor = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "El userId del vendedor es requerido",
      });
    }

    const { data: productos, error: productosError } = await supabase
      .from("producto")
      .select("id_producto")
      .eq("id_usuario", userId);

    if (productosError) {
      console.error("Error al obtener productos del vendedor:", productosError);
      return res.status(500).json({
        success: false,
        message: "Error al obtener los productos del vendedor",
      });
    }

    if (!productos || productos.length === 0) {
      return res.json({
        success: true,
        data: {
          id_usuario: userId,
          total_ventas: 0,
          total_items_vendidos: 0,
          total_ordenes_pagadas: 0,
          calculado_en: new Date().toISOString(),
        },
      });
    }

    const productIds = productos.map((producto) => producto.id_producto);

    const { data: ordenesDetalle, error: detallesError } = await supabase
      .from("orden_detalle")
      .select("id_orden, cantidad, precio_unitario")
      .in("id_producto", productIds);

    if (detallesError) {
      console.error("Error al obtener detalle de órdenes:", detallesError);
      return res.status(500).json({
        success: false,
        message: "Error al obtener las ventas del vendedor",
      });
    }

    if (!ordenesDetalle || ordenesDetalle.length === 0) {
      return res.json({
        success: true,
        data: {
          id_usuario: userId,
          total_ventas: 0,
          total_items_vendidos: 0,
          total_ordenes_pagadas: 0,
          calculado_en: new Date().toISOString(),
        },
      });
    }

    const orderIds = [...new Set(ordenesDetalle.map((item) => item.id_orden))];

    const { data: ordenesPagadas, error: ordenesError } = await supabase
      .from("orden")
      .select("id_orden")
      .in("id_orden", orderIds)
      .eq("estado", "PAGADA");

    if (ordenesError) {
      console.error("Error al obtener órdenes pagadas:", ordenesError);
      return res.status(500).json({
        success: false,
        message: "Error al filtrar órdenes pagadas del vendedor",
      });
    }

    const paidOrderSet = new Set((ordenesPagadas || []).map((orden) => orden.id_orden));

    const resumen = ordenesDetalle.reduce(
      (acc, item) => {
        if (!paidOrderSet.has(item.id_orden)) {
          return acc;
        }

        const cantidad = Number(item.cantidad ?? 1);
        const precioUnitario = Number(item.precio_unitario ?? 0);

        acc.totalVentas += precioUnitario * cantidad;
        acc.totalItemsVendidos += cantidad;
        return acc;
      },
      {
        totalVentas: 0,
        totalItemsVendidos: 0,
      }
    );

    return res.json({
      success: true,
      data: {
        id_usuario: userId,
        total_ventas: Number(resumen.totalVentas.toFixed(2)),
        total_items_vendidos: resumen.totalItemsVendidos,
        total_ordenes_pagadas: paidOrderSet.size,
        calculado_en: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error en obtenerTotalVentasVendedor:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};
