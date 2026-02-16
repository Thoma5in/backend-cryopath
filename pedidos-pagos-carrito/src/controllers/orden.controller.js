import {supabase} from "../config/supabase.js";

export const crearOrden = async (req, res) => {
    try {
        const { userId, items, total } = req.body;

        if (!userId || !items || items.length === 0 || !total) {
            return res.status(400).json({ success: false, message: "Faltan datos requeridos" });
    }

    //Crear orden en BD
    const {data: nuevaOrden, error: ordenError} = await supabase
    .from("orden")
    .insert({
        id_usuario: userId,
        total,
        estado: "PENDIENTE", 
    })
    .select()
    .single();

    if (ordenError) {
        return res.status(500).json({ success: false, message: "Error al crear la orden" });
    }

    //Insertar detalles
    const detalles = items.map((item) => ({
        id_orden: nuevaOrden.id_orden,
        id_producto: item.productoId,
        cantidad: item.cantidad,
        precio_unitario: item.precio,  
    }))

    const {error: detallesError} = await supabase
    .from("orden_detalle")
    .insert(detalles)

    if (detallesError) {
        return res.status(500).json({ success: false, message: "Error al crear los detalles de la orden" });
    }

    return res.json({id_orden: nuevaOrden.id_orden });

 } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Error al procesar la orden" });
 }
} 