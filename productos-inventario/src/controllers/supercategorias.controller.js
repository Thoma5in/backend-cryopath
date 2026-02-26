import { supabase } from "../config/supabase.js";
import { getCached, setCached, invalidatePattern, invalidateSupercategoriasCache } from "../services/cache.service.js";

/**
 * POST /supercategorias
 * Crear supercategoría
 */
export const crearSupercategoria = async (req, res) => {
    try {
        const { nombre, descripcion, estado = true } = req.body;

        if (!nombre || nombre.trim() === "") {
            return res.status(400).json({
                message: "El nombre de la supercategoría es obligatorio"
            });
        }

        // Verificar si ya existe
        const { data: existente, error: errorExistente } = await supabase
            .from("super_categoria")
            .select("id_super_categoria")
            .eq("nombre", nombre)
            .maybeSingle();

        if (errorExistente) throw errorExistente;

        if (existente) {
            return res.status(409).json({
                message: "Ya existe una supercategoría con ese nombre"
            });
        }

        // Insertar
        const { data, error } = await supabase
            .from("super_categoria")
            .insert([
                {
                    nombre,
                    descripcion,
                    estado
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Invalidar caché de supercategorías
        await invalidateSupercategoriasCache();

        return res.status(201).json(data);

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al crear supercategoría"
        });
    }
};

/**
 * GET /supercategorias
 * Listar todas las supercategorías
 */
export const listarSupercategorias = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("super_categoria")
            .select("*")
            .eq("estado", true)
            .order("nombre", { ascending: true });

        if (error) throw error;

        return res.json(data);

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al listar supercategorías"
        });
    }
};

/**
 * GET /supercategorias/:id_super_categoria
 * Obtener supercategoría por ID
 */
export const obtenerSupercategoria = async (req, res) => {
    try {
        const { id_super_categoria } = req.params;

        // Validar que sea un número
        if (isNaN(id_super_categoria)) {
            return res.status(400).json({
                message: "id_super_categoria debe ser un número"
            });
        }

        const { data, error } = await supabase
            .from("super_categoria")
            .select("*")
            .eq("id_super_categoria", id_super_categoria)
            .single();

        if (error) {
            return res.status(404).json({
                message: "Supercategoría no encontrada"
            });
        }

        return res.json(data);

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al obtener supercategoría"
        });
    }
};

/**
 * PUT /supercategorias/:id_super_categoria
 * Actualizar supercategoría
 */
export const actualizarSupercategoria = async (req, res) => {
    try {
        const { id_super_categoria } = req.params;
        const datos = req.body;

        // Validar que sea un número
        if (isNaN(id_super_categoria)) {
            return res.status(400).json({
                message: "id_super_categoria debe ser un número"
            });
        }

        const { data, error } = await supabase
            .from("super_categoria")
            .update(datos)
            .eq("id_super_categoria", id_super_categoria)
            .select()
            .single();

        if (error) throw error;

        // Invalidar caché de esta supercategoría
        await invalidateSupercategoriasCache(id_super_categoria);

        return res.json(data);

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al actualizar supercategoría"
        });
    }
};

/**
 * DELETE /supercategorias/:id_super_categoria
 * Eliminar supercategoría
 */
export const eliminarSupercategoria = async (req, res) => {
    try {
        const { id_super_categoria } = req.params;

        // Validar que sea un número
        if (isNaN(id_super_categoria)) {
            return res.status(400).json({
                message: "id_super_categoria debe ser un número"
            });
        }

        const { error } = await supabase
            .from("super_categoria")
            .delete()
            .eq("id_super_categoria", id_super_categoria);

        if (error) throw error;

        // Invalidar caché de esta supercategoría
        await invalidateSupercategoriasCache(id_super_categoria);

        return res.status(204).send();

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al eliminar supercategoría"
        });
    }
};

/**
 * GET /supercategorias/:id_super_categoria/categorias
 * Obtener todas las categorías de una supercategoría
 */
export const obtenerCategoriasDeSupercategoria = async (req, res) => {
    try {
        const { id_super_categoria } = req.params;

        // Validar que sea un número
        if (isNaN(id_super_categoria)) {
            return res.status(400).json({
                message: "id_super_categoria debe ser un número"
            });
        }

        // Verificar que la supercategoría existe
        const { data: supercategoriaExiste, error: errorSupercat } = await supabase
            .from("super_categoria")
            .select("id_super_categoria")
            .eq("id_super_categoria", id_super_categoria)
            .single();

        if (errorSupercat || !supercategoriaExiste) {
            return res.status(404).json({
                message: "Supercategoría no encontrada"
            });
        }

        // Obtener categorías mediante la tabla super_categoria_categoria
        const { data, error } = await supabase
            .from("super_categoria_categoria")
            .select(`
                id_categoria,
                categoria (
                    id_categoria,
                    nombre,
                    descripcion
                )
            `)
            .eq("id_super_categoria", id_super_categoria);

        if (error) throw error;

        // Extraer solo los datos de categoría
        const categorias = data.map(item => item.categoria);

        return res.json(categorias);

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al obtener categorías"
        });
    }
};

/**
 * POST /supercategorias/:id_super_categoria/categorias/:id_categoria
 * Asignar una categoría a una supercategoría
 */
export const asignarCategoriaASupercategoria = async (req, res) => {
    try {
        const { id_super_categoria, id_categoria } = req.params;

        // Validar que sean números
        if (isNaN(id_super_categoria) || isNaN(id_categoria)) {
            return res.status(400).json({
                message: "id_super_categoria e id_categoria deben ser números"
            });
        }

        // Verificar que ambos existen
        const { data: supercatExiste, error: errorSupercat } = await supabase
            .from("super_categoria")
            .select("id_super_categoria")
            .eq("id_super_categoria", id_super_categoria)
            .single();

        if (errorSupercat || !supercatExiste) {
            return res.status(404).json({
                message: "Supercategoría no encontrada"
            });
        }

        const { data: catExiste, error: errorCat } = await supabase
            .from("categoria")
            .select("id_categoria")
            .eq("id_categoria", id_categoria)
            .single();

        if (errorCat || !catExiste) {
            return res.status(404).json({
                message: "Categoría no encontrada"
            });
        }

        // Verificar si ya existe la relación
        const { data: relacionExiste } = await supabase
            .from("super_categoria_categoria")
            .select("*")
            .eq("id_super_categoria", id_super_categoria)
            .eq("id_categoria", id_categoria)
            .maybeSingle();

        if (relacionExiste) {
            return res.status(409).json({
                message: "Esta categoría ya está asignada a la supercategoría"
            });
        }

        // Insertar relación
        const { data, error } = await supabase
            .from("super_categoria_categoria")
            .insert([
                {
                    id_super_categoria,
                    id_categoria
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Invalidar caché de productos de esta supercategoría
        await invalidatePattern(`supercategoria:productos:${id_super_categoria}:*`);
        console.log(`🗑️ Caché invalidado - categoría ${id_categoria} asignada a supercategoría ${id_super_categoria}`);

        return res.status(201).json(data);

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al asignar categoría"
        });
    }
};

/**
 * DELETE /supercategorias/:id_super_categoria/categorias/:id_categoria
 * Desasignar una categoría de una supercategoría
 */
export const desasignarCategoriaDeSupercategoria = async (req, res) => {
    try {
        const { id_super_categoria, id_categoria } = req.params;

        // Validar que sean números
        if (isNaN(id_super_categoria) || isNaN(id_categoria)) {
            return res.status(400).json({
                message: "id_super_categoria e id_categoria deben ser números"
            });
        }

        const { error } = await supabase
            .from("super_categoria_categoria")
            .delete()
            .eq("id_super_categoria", id_super_categoria)
            .eq("id_categoria", id_categoria);

        if (error) throw error;

        // Invalidar caché de productos de esta supercategoría
        await invalidatePattern(`supercategoria:productos:${id_super_categoria}:*`);
        console.log(`🗑️ Caché invalidado - categoría ${id_categoria} desasignada de supercategoría ${id_super_categoria}`);

        return res.status(204).send();

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error al desasignar categoría"
        });
    }
};

/**
 * GET /supercategorias/:id_super_categoria/productos
 * Filtrar productos por supercategoría
 * 
 * Parámetros opcionales de query:
 * - limit: número de productos a retornar (default: 100)
 * - offset: número de productos a saltar (default: 0)
 * - estado: filtrar por estado (activo, inactivo, etc.)
 */
export const obtenerProductosPorSupercategoria = async (req, res) => {
    try {
        const { id_super_categoria } = req.params;
        const { limit = 100, offset = 0, estado = "activo" } = req.query;

        // Validar que sea un número
        if (isNaN(id_super_categoria)) {
            return res.status(400).json({
                message: "id_super_categoria debe ser un número"
            });
        }

        // Validar limit y offset
        const limitNum = Math.min(parseInt(limit) || 100, 1000);
        const offsetNum = parseInt(offset) || 0;

        if (limitNum < 1 || offsetNum < 0) {
            return res.status(400).json({
                message: "limit debe ser > 0 y offset >= 0"
            });
        }

        // Generar clave de caché única para esta consulta
        const cacheKey = `supercategoria:productos:${id_super_categoria}:${limitNum}:${offsetNum}:${estado}`;

        // Intentar obtener del caché
        const cached = await getCached(cacheKey);
        if (cached) {
            console.log(`✅ CACHE HIT - Productos de supercategoría ${id_super_categoria} desde Redis`);
            return res.json({
                ...cached,
                _cache: "HIT"
            });
        }

        console.log(`❌ CACHE MISS - Obteniendo productos de supercategoría ${id_super_categoria} desde Supabase...`);

        // Verificar que la supercategoría existe
        const { data: supercategoriaExiste, error: errorSupercat } = await supabase
            .from("super_categoria")
            .select("id_super_categoria")
            .eq("id_super_categoria", id_super_categoria)
            .single();

        if (errorSupercat || !supercategoriaExiste) {
            return res.status(404).json({
                message: "Supercategoría no encontrada"
            });
        }

        // Consulta para obtener productos
        // Flujo: super_categoria -> super_categoria_categoria -> categoria -> producto_categoria -> producto
        let query = supabase
            .from("super_categoria_categoria")
            .select(`
                categoria (
                    id_categoria,
                    nombre,
                    descripcion,
                    producto_categoria (
                        id_producto,
                        producto (
                            id_producto,
                            nombre,
                            descripcion,
                            precio_base,
                            estado,
                            fecha_registro,
                            id_usuario
                        )
                    )
                )
            `)
            .eq("id_super_categoria", id_super_categoria);

        const { data, error } = await query;

        if (error) throw error;

        // Procesar y aplanar los datos
        const productos = [];
        const productosVistos = new Set();

        for (const item of data) {
            const categoria = item.categoria;
            if (!categoria?.producto_categoria) continue;

            for (const pc of categoria.producto_categoria) {
                const producto = pc.producto;
                if (!producto) continue;

                if (estado && producto.estado !== estado) continue;

                const id = producto.id_producto;
                if (productosVistos.has(id)) continue;

                productos.push({
                    ...producto,
                    id_categoria: categoria.id_categoria,
                    categoria_nombre: categoria.nombre,
                    categoria_descripcion: categoria.descripcion
                });

                productosVistos.add(id);
            }
        }


        // Aplicar paginación
        const total = productos.length;
        const productoPaginados = productos.slice(offsetNum, offsetNum + limitNum);

        const response = {
            total,
            limit: limitNum,
            offset: offsetNum,
            count: productoPaginados.length,
            data: productoPaginados,
            _cache: "MISS"
        };

        // Guardar en caché
        await setCached(cacheKey, {
            total,
            limit: limitNum,
            offset: offsetNum,
            count: productoPaginados.length,
            data: productoPaginados
        }, "productos");

        console.log(`💾 Productos de supercategoría ${id_super_categoria} guardados en caché`);

        return res.json(response);

    } catch (error) {
        console.error("Error al obtener productos por supercategoría:", error);
        return res.status(500).json({
            message: error.message || "Error al obtener productos"
        });
    }
};
