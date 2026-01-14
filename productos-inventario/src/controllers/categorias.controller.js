import { supabase } from "../config/supabase.js";

/**
 * POST /categorias
 * Crear categoría
 */
export const crearCategorias = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({
                message: "El nombre de la categoría es obligatorio"
            });
        }

        // Verificar si ya existe (NO usar single)
        const { data: existente, error: errorExistente } = await supabase
            .from("categoria")
            .select("id_categoria")
            .eq("nombre", nombre)
            .maybeSingle();

        if (errorExistente) throw errorExistente;

        if (existente) {
            return res.status(409).json({
                message: "Ya existe una categoría con ese nombre"
            });
        }

        // Insertar (SIEMPRE array)
        const { data, error } = await supabase
            .from("categoria")
            .insert([
                {
                    nombre,
                    descripcion
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return res.status(201).json(data);

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al crear categoría"
        });
    }
};

/**
 * GET /categorias
 * Listar categorías
 */
export const listarCategorias = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("categoria")
            .select("*")
            .order("nombre", { ascending: true });

        if (error) throw error;

        return res.json(data);

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al listar categorías"
        });
    }
};

/**
 * GET /categorias/:id
 * Obtener categoría por ID
 */
export const obtenerCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from("categoria")
            .select("*")
            .eq("id_categoria", id)
            .single();

        if (error) {
            return res.status(404).json({
                message: "Categoría no encontrada"
            });
        }

        return res.json(data);

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al obtener categoría"
        });
    }
};

/**
 * PUT /categorias/:id
 * Actualizar categoría
 */
export const actualizarCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const datos = req.body;

        const { data, error } = await supabase
            .from("categoria")
            .update(datos)
            .eq("id_categoria", id)
            .select()
            .single();

        if (error) throw error;

        return res.json(data);

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al actualizar categoría"
        });
    }
};

/**
 * DELETE /categorias/:id
 * Eliminar categoría
 */
export const eliminarCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar relación con productos
        const { data: relaciones, error: errorRel } = await supabase
            .from("producto")
            .select("id_producto")
            .eq("id_categoria", id);

        if (errorRel) throw errorRel;

        if (relaciones && relaciones.length > 0) {
            return res.status(400).json({
                message: "No se puede eliminar la categoría porque tiene productos asociados"
            });
        }

        const { error } = await supabase
            .from("categoria")
            .delete()
            .eq("id_categoria", id);

        if (error) throw error;

        return res.status(204).send();

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al eliminar categoría"
        });
    }
};
