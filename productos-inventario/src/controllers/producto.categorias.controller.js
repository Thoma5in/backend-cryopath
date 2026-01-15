import { supabase } from "../config/supabase.js";

/**
 * GET /productos/:id_producto/categoria
 * Obtener la categoría de un producto
 */
export const obtenerCategoriasProducto = async (req, res) => {
    try {
        const { id_producto } = req.params;

        if (!id_producto) {
            return res.status(400).json({
                message: "id_producto es obligatorio"
            });
        }

        const { data, error } = await supabase
            .from("producto_categoria")
            .select(`
                id_categoria,
                categoria(
                    id_categoria,
                    nombre,
                    descripcion
                )
            `)
            .eq("id_producto", id_producto);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.status(404).json({
                message: "El producto no tiene categoría asignada"
            });
        }

        return res.json({
            id_producto,
            categoria: data[0].categoria
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al obtener categoría del producto"
        });
    }
};

/**
 * GET /categorias/:id_categoria/productos
 * Obtener todos los productos de una categoría
 */
export const obtenerProductosPorCategoria = async (req, res) => {
    try {
        const { id_categoria } = req.params;

        if (!id_categoria) {
            return res.status(400).json({
                message: "id_categoria es obligatorio"
            });
        }

        const { data, error } = await supabase
            .from("producto_categoria")
            .select(`
                id_producto,
                producto(
                    id_producto,
                    nombre,
                    descripcion,
                    precio_base,
                    estado
                )
            `)
            .eq("id_categoria", id_categoria);

        if (error) throw error;

        if (!data || data.length === 0) {
            return res.json({
                id_categoria,
                productos: []
            });
        }

        const productos = data.map(item => item.producto);

        return res.json({
            id_categoria,
            productos
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al obtener productos por categoría"
        });
    }
};
