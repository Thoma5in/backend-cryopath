import { supabase } from "../config/supabase.js";

/**
 * GET /inventario
 * Público o autenticado
 */
export const getInventario = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('inventario')
            .select(`
                id_producto,
                cantidad_disponible,
                ultima_actualizacion
            `);

        if (error) throw error;

        

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo inventario' });
    }


};

/**
 * GET /inventario/:id_producto
 */

export const getInventarioByProducto = async (req, res) => {
    const { id_producto } = req.params;

    try {
        const { data, error } = await supabase
            .from('inventario')
            .select('id_producto, cantidad_disponible')
            .eq('id_producto', id_producto)
            .single();

        if (error) {
            return res.status(404).json({ message: 'Inventario no encontrado' });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error consultando inventario' });
    }
};


/**
 * PUT /inventario/:id_producto
 * ADMIN ONLY
 * Ajuste manual de stock
 */
export const updateInventario = async (req, res) => {
    const { id_producto } = req.params;
    const { cantidad_disponible } = req.body;

    if (!Number.isInteger(cantidad_disponible) || cantidad_disponible < 0) {
        return res.status(400).json({
            message: 'La cantidad debe ser un entero >= 0'
        });
    }

    try {
        const { data, error } = await supabase
            .from('inventario')
            .update({
                cantidad_disponible,
                ultima_actualizacion: new Date().toISOString()
            })
            .eq('id_producto', id_producto)
            .select()
            .single();

        if (error || !data) {
            return res.status(404).json({
                message: 'Inventario no encontrado'
            });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error actualizando inventario' });
    }
};

/**
 * PATCH /inventario/descontar
 * USO INTERNO (ÓRDENES)
 * NO exponer al frontend
 */
export const descontarInventario = async (id_producto, cantidad) => {
    if (cantidad <= 0) throw new Error('Cantidad inválida');

    const { data, error } = await supabase.rpc(
        'descontar_inventario',
        { p_id_producto: id_producto, p_cantidad: cantidad }
    );

    if (error) {
        throw new Error('Stock insuficiente');
    }

    return data;
};

