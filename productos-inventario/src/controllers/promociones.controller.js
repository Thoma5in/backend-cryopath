import {supabase} from '../config/supabase.js';

// Obtener promociones con sus categorías asociadas
export const obtenerPromocionesConCategorias = async (req, res) => {
	try {
		// Hacemos join entre promociones, promociones_categorias y categoria
		const { data, error } = await supabase
			.from('promociones')
			.select(`*, promociones_categorias:promociones_categorias(id_categoria, categoria:categoria(id_categoria, nombre, descripcion))`);

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		// Formatear para que cada promoción tenga un array de categorías
		const promociones = data.map(promocion => {
			const categorias = (promocion.promociones_categorias || []).map(rel => rel.categoria).filter(Boolean);
			// Eliminar el campo promociones_categorias para limpiar la respuesta
			const { promociones_categorias, ...rest } = promocion;
			return { ...rest, categorias };
		});

		return res.status(200).json({ promociones });
	} catch (error) {
		console.error("Error al obtener promociones con categorías:", error);
		return res.status(500).json({
			error: "Error interno del servidor",
		});
	}
};

// Obtener promociones con sus productos asociados
export const obtenerPromocionesConProductos = async (req, res) => {
	try {
		// Hacemos join entre promociones, promociones_productos y producto
		const { data, error } = await supabase
			.from('promociones')
			.select(`*, promociones_productos:promociones_productos(id_producto, producto:producto(id_producto, nombre, descripcion, precio_base, estado))`);

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		// Formatear para que cada promocion tenga un array de productos
		const promociones = data.map(promocion => {
			const productos = (promocion.promociones_productos || []).map(rel => rel.producto).filter(Boolean);
			// Eliminar el campo promociones_productos para limpiar la respuesta
			const { promociones_productos, ...rest } = promocion;
			return { ...rest, productos };
		});

		return res.status(200).json({ promociones });
	} catch (error) {
		console.error("Error al obtener promociones con productos:", error);
		return res.status(500).json({
			error: "Error interno del servidor",
		});
	}
};


export const obtenerPromociones = async (req, res) => {
	try {
		const { data, error } = await supabase.from("promociones").select("*");
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(200).json({ promociones: data });
	} catch (error) {
		console.error("Error al obtener promociones:", error);
		return res.status(500).json({
			error: "Error interno del servidor",
		});
	}
};

export const crearPromociondeCategoria = async (req, res) => {
	try {
		const {
			nombre,
			descripcion,
			tipo_descuento,
			valor_descuento,
			fecha_inicio,
			fecha_fin,
			activa = true,
			prioridad = 0,
			combinable = false,
			id_categorias = []
		} = req.body;

		// Validar campos requeridos
		if (!nombre || !tipo_descuento || !valor_descuento || !fecha_inicio || !fecha_fin) {
			return res.status(400).json({
				error: "Faltan campos requeridos: nombre, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin"
			});
		}

		// Validar tipo_descuento
		const tiposValidos = ['porcentaje', 'monto_fijo'];
		if (!tiposValidos.includes(tipo_descuento)) {
			return res.status(400).json({
				error: "tipo_descuento debe ser 'porcentaje' o 'monto_fijo'"
			});
		}

		// Validar valor_descuento
		if (valor_descuento <= 0) {
			return res.status(400).json({
				error: "valor_descuento debe ser mayor a 0"
			});
		}

		// Insertar la promoción
		const { data: promocion, error: errorPromocion } = await supabase
			.from("promociones")
			.insert({
				nombre,
				descripcion,
				tipo_descuento,
				valor_descuento: parseFloat(valor_descuento),
				fecha_inicio,
				fecha_fin,
				activa,
				prioridad: parseInt(prioridad),
				combinable
			})
			.select();

		if (errorPromocion) {
			return res.status(400).json({ error: errorPromocion.message });
		}

		const id_promocion = promocion[0].id_promocion;

		// Si hay categorías, insertar las relaciones en la tabla intermedia
		if (id_categorias.length > 0) {
			const relacionesCategorias = id_categorias.map(id_categoria => ({
				id_promocion,
				id_categoria
			}));

			const { error: errorRelaciones } = await supabase
				.from("promociones_categorias")
				.insert(relacionesCategorias);

			if (errorRelaciones) {
				// Si falla la inserción de relaciones, eliminar la promoción creada
				await supabase
					.from("promociones")
					.delete()
					.eq("id_promocion", id_promocion);

				return res.status(400).json({
					error: "Error al asignar categorías: " + errorRelaciones.message
				});
			}
		}

		return res.status(201).json({
			message: "Promoción creada exitosamente",
			promocion: promocion[0]
		});
	} catch (error) {
		console.error("Error al crear promoción:", error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
};

export const crearPromocionDeProducto = async (req, res) => {
	try {
		const {
			nombre,
			descripcion,
			tipo_descuento,
			valor_descuento,
			fecha_inicio,
			fecha_fin,
			activa = true,
			prioridad = 0,
			combinable = false,
			id_productos = []
		} = req.body;

		// Validar campos requeridos
		if (!nombre || !tipo_descuento || !valor_descuento || !fecha_inicio || !fecha_fin) {
			return res.status(400).json({
				error: "Faltan campos requeridos: nombre, tipo_descuento, valor_descuento, fecha_inicio, fecha_fin"
			});
		}

		// Validar tipo_descuento
		const tiposValidos = ['porcentaje', 'monto_fijo'];
		if (!tiposValidos.includes(tipo_descuento)) {
			return res.status(400).json({
				error: "tipo_descuento debe ser 'porcentaje' o 'monto_fijo'"
			});
		}

		// Validar valor_descuento
		if (valor_descuento <= 0) {
			return res.status(400).json({
				error: "valor_descuento debe ser mayor a 0"
			});
		}

		// Insertar la promocion
		const { data: promocion, error: errorPromocion } = await supabase
			.from("promociones")
			.insert({
				nombre,
				descripcion,
				tipo_descuento,
				valor_descuento: parseFloat(valor_descuento),
				fecha_inicio,
				fecha_fin,
				activa,
				prioridad: parseInt(prioridad),
				combinable
			})
			.select();

		if (errorPromocion) {
			return res.status(400).json({ error: errorPromocion.message });
		}

		const id_promocion = promocion[0].id_promocion;

		// Si hay productos, insertar las relaciones en la tabla intermedia
		if (id_productos.length > 0) {
			const relacionesProductos = id_productos.map(id_producto => ({
				id_promocion,
				id_producto
			}));

			const { error: errorRelaciones } = await supabase
				.from("promociones_productos")
				.insert(relacionesProductos);

			if (errorRelaciones) {
				// Si falla la insercion de relaciones, eliminar la promocion creada
				await supabase
					.from("promociones")
					.delete()
					.eq("id_promocion", id_promocion);

				return res.status(400).json({
					error: "Error al asignar productos: " + errorRelaciones.message
				});
			}
		}

		return res.status(201).json({
			message: "Promocion creada exitosamente",
			promocion: promocion[0]
		});
	} catch (error) {
		console.error("Error al crear promocion:", error);
		return res.status(500).json({
			error: "Error interno del servidor"
		});
	}
};