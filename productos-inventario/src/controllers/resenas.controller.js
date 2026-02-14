import { supabase } from "../config/supabase.js";

// Crear una reseña
export const crearResena = async (req, res) => {
	const { id_producto, id_usuario, estrellas, comentario } = req.body;

	if (!id_producto || !id_usuario || estrellas === undefined) {
		return res.status(400).json({
			message: "id_producto, id_usuario y estrellas son obligatorios"
		});
	}

	if (estrellas < 1 || estrellas > 5) {
		return res.status(400).json({
			message: "Las estrellas deben estar entre 1 y 5"
		});
	}

	try {
		// Verificar si el usuario ha comprado este producto
		console.log("🔍 [RESENA] Verificando compra - id_usuario:", id_usuario, "id_producto:", id_producto);
		
		const { data: compraExistente, error: compraError } = await supabase
			.from("orden")
			.select(`
				id_orden,
				orden_detalle!inner (
					id_producto
				)
			`)
			.eq("id_usuario", id_usuario)
			.eq("orden_detalle.id_producto", id_producto)
			.in("estado", ["completado", "entregado", "pagado"])
			.limit(1);

		console.log("📦 [RESENA] Resultado compra:", compraExistente);
		console.log("❌ [RESENA] Error compra:", compraError);

		if (compraError) {
			console.error("Error al verificar compra:", compraError);
			return res.status(500).json({
				error: "Error al verificar la compra del producto",
				debug: compraError.message
			});
		}

		if (!compraExistente || compraExistente.length === 0) {
			return res.status(403).json({
				message: "Solo puedes dejar una reseña si has comprado este producto"
			});
		}

		// Verificar si el usuario ya tiene una reseña para este producto
		const { data: resenaExistente } = await supabase
			.from("producto_resena")
			.select("id_resena")
			.eq("id_producto", id_producto)
			.eq("id_usuario", id_usuario)
			.single();

		if (resenaExistente) {
			return res.status(409).json({
				message: "Ya has dejado una reseña para este producto"
			});
		}

		const { data, error } = await supabase
			.from("producto_resena")
			.insert({
				id_producto,
				id_usuario,
				estrellas,
				comentario: comentario || null
			})
			.select()
			.single();

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		return res.status(201).json({
			message: "Reseña creada exitosamente",
			resena: data
		});

	} catch (error) {
		console.error("Error al crear reseña:", error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
};

// Obtener reseñas de un producto con estadísticas
export const obtenerResenasPorProducto = async (req, res) => {
	const { id_producto } = req.params;
	const limit = Number(req.query.limit) || 10;
	const offset = Number(req.query.offset) || 0;

	if (!id_producto) {
		return res.status(400).json({
			message: "El id_producto es obligatorio"
		});
	}

	try {
		// Obtener reseñas
		const { data: resenas, error } = await supabase
			.from("producto_resena")
			.select(`
				id_resena,
				id_usuario,
				estrellas,
				comentario,
				fecha_creacion
			`)
			.eq("id_producto", id_producto)
			.order("fecha_creacion", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) throw error;

		// Obtener estadísticas
		const { data: stats, error: statsError } = await supabase
			.from("producto_resena")
			.select("estrellas")
			.eq("id_producto", id_producto);

		if (statsError) throw statsError;

		const totalResenas = stats?.length || 0;
		const promedioEstrellas = totalResenas > 0
			? (stats.reduce((sum, r) => sum + r.estrellas, 0) / totalResenas).toFixed(1)
			: 0;

		// Distribución de estrellas
		const distribucion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		stats?.forEach(r => {
			distribucion[r.estrellas]++;
		});

		return res.status(200).json({
			id_producto,
			estadisticas: {
				total: totalResenas,
				promedio: Number(promedioEstrellas),
				distribucion
			},
			resenas: resenas || []
		});

	} catch (error) {
		console.error("Error al obtener reseñas:", error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
};

// Obtener solo el promedio (endpoint ligero para listados)
export const obtenerPromedioProducto = async (req, res) => {
	const { id_producto } = req.params;

	if (!id_producto) {
		return res.status(400).json({
			message: "El id_producto es obligatorio"
		});
	}

	try {
		const { data, error } = await supabase
			.from("producto_resena")
			.select("estrellas")
			.eq("id_producto", id_producto);

		if (error) throw error;

		const total = data?.length || 0;
		const promedio = total > 0
			? (data.reduce((sum, r) => sum + r.estrellas, 0) / total).toFixed(1)
			: 0;

		return res.status(200).json({
			id_producto,
			total,
			promedio: Number(promedio)
		});

	} catch (error) {
		console.error("Error al obtener promedio:", error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
};

// Editar una reseña
export const editarResena = async (req, res) => {
	const { id_resena } = req.params;
	const { id_usuario, estrellas, comentario } = req.body;

	if (!id_resena || !id_usuario) {
		return res.status(400).json({
			message: "id_resena e id_usuario son obligatorios"
		});
	}

	if (estrellas !== undefined && (estrellas < 1 || estrellas > 5)) {
		return res.status(400).json({
			message: "Las estrellas deben estar entre 1 y 5"
		});
	}

	try {
		// Verificar que la reseña pertenece al usuario
		const { data: resenaExistente, error: findError } = await supabase
			.from("producto_resena")
			.select("id_usuario")
			.eq("id_resena", id_resena)
			.single();

		if (findError || !resenaExistente) {
			return res.status(404).json({ message: "Reseña no encontrada" });
		}

		if (resenaExistente.id_usuario !== id_usuario) {
			return res.status(403).json({
				message: "No tienes permiso para editar esta reseña"
			});
		}

		const camposActualizar = {};
		if (estrellas !== undefined) camposActualizar.estrellas = estrellas;
		if (comentario !== undefined) camposActualizar.comentario = comentario;

		if (Object.keys(camposActualizar).length === 0) {
			return res.status(400).json({
				message: "No se proporcionaron campos para actualizar"
			});
		}

		const { data, error } = await supabase
			.from("producto_resena")
			.update(camposActualizar)
			.eq("id_resena", id_resena)
			.select()
			.single();

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		return res.status(200).json({
			message: "Reseña actualizada exitosamente",
			resena: data
		});

	} catch (error) {
		console.error("Error al editar reseña:", error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
};

// Eliminar una reseña
export const eliminarResena = async (req, res) => {
	const { id_resena } = req.params;
	const { id_usuario } = req.body;

	if (!id_resena || !id_usuario) {
		return res.status(400).json({
			message: "id_resena e id_usuario son obligatorios"
		});
	}

	try {
		// Verificar que la reseña pertenece al usuario
		const { data: resenaExistente, error: findError } = await supabase
			.from("producto_resena")
			.select("id_usuario")
			.eq("id_resena", id_resena)
			.single();

		if (findError || !resenaExistente) {
			return res.status(404).json({ message: "Reseña no encontrada" });
		}

		if (resenaExistente.id_usuario !== id_usuario) {
			return res.status(403).json({
				message: "No tienes permiso para eliminar esta reseña"
			});
		}

		const { error } = await supabase
			.from("producto_resena")
			.delete()
			.eq("id_resena", id_resena);

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		return res.status(200).json({
			message: "Reseña eliminada exitosamente"
		});

	} catch (error) {
		console.error("Error al eliminar reseña:", error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
};

// Obtener reseñas de un usuario
export const obtenerResenasPorUsuario = async (req, res) => {
	const { id_usuario } = req.params;
	const limit = Number(req.query.limit) || 10;
	const offset = Number(req.query.offset) || 0;

	if (!id_usuario) {
		return res.status(400).json({
			message: "El id_usuario es obligatorio"
		});
	}

	try {
		const { data, error } = await supabase
			.from("producto_resena")
			.select(`
				id_resena,
				id_producto,
				estrellas,
				comentario,
				fecha_creacion,
				producto (
					id_producto,
					nombre,
					producto_imagen (
						url
					)
				)
			`)
			.eq("id_usuario", id_usuario)
			.order("fecha_creacion", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) throw error;

		const resenas = (data || []).map(r => ({
			id_resena: r.id_resena,
			estrellas: r.estrellas,
			comentario: r.comentario,
			fecha_creacion: r.fecha_creacion,
			producto: {
				id_producto: r.producto?.id_producto,
				nombre: r.producto?.nombre,
				imagen: r.producto?.producto_imagen?.[0]?.url || "/img/no-image.png"
			}
		}));

		return res.status(200).json({
			id_usuario,
			total: resenas.length,
			resenas
		});

	} catch (error) {
		console.error("Error al obtener reseñas del usuario:", error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
};
