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
 * POST /inventario
 * ADMIN ONLY
 * Crea inventario inicial para un producto

////////////////////////////////////////////
 * AUTENTICADO (cualquier usuario)
 * Crea inventario inicial para un producto
 */

/** 
export const createInventario = async (req, res) => {
    const { id_producto, cantidad_disponible } = req.body;

    if (!id_producto) {
        return res.status(400).json({
            message: 'id_producto es requerido'
        });
    }

    if (!Number.isInteger(cantidad_disponible) || cantidad_disponible < 0) {
        return res.status(400).json({
            message: 'La cantidad debe ser un entero >= 0'
        });
    }

    try {
        // 1. Verificar que el producto exista
        const { data: producto, error: productoError } = await supabase
            .from('producto')
            .select('id_producto')
            .eq('id_producto', id_producto)
            .single();

        if (productoError || !producto) {
            return res.status(404).json({
                message: 'Producto no existe'
            });
        }

        // 2. Verificar que no exista inventario previo
        const { data: existente } = await supabase
            .from('inventario')
            .select('id_producto')
            .eq('id_producto', id_producto)
            .maybeSingle();

        if (existente) {
            return res.status(409).json({
                message: 'El inventario ya existe para este producto'
            });
        }

        // 3. Crear inventario
        const { data, error } = await supabase
            .from('inventario')
            .insert({
                id_producto,
                cantidad_disponible,
                ultima_actualizacion: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error creando inventario'
        });
    }
};
*/


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

