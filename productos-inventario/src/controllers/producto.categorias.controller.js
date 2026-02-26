import { supabase } from "../config/supabase.js";
import { getCached, setCached } from "../services/cache.service.js";

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

        const cacheKey = `producto:categoria:${id_producto}`;
        const cached = await getCached(cacheKey);

        if (cached) {
            return res.json({
                ...cached,
                _cache: "HIT"
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

        const response = {
            id_producto,
            categoria: data[0].categoria
        };

        await setCached(cacheKey, response, "producto_categoria");

        return res.json({
            ...response,
            _cache: "MISS"
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

        const cacheKey = `categoria:productos:${id_categoria}`;
        const cached = await getCached(cacheKey);

        if (cached) {
            return res.json({
                ...cached,
                _cache: "HIT"
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
            const emptyResponse = {
                id_categoria,
                productos: []
            };

            await setCached(cacheKey, emptyResponse, "producto_categoria");

            return res.json({
                ...emptyResponse,
                _cache: "MISS"
            });
        }

        const productos = data.map(item => item.producto);

        const response = {
            id_categoria,
            productos
        };

        await setCached(cacheKey, response, "producto_categoria");

        return res.json({
            ...response,
            _cache: "MISS"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al obtener productos por categoría"
        });
    }
};
