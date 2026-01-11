import { supabase } from "../config/supabase.js";


const extraerRutaObjeto = (url) => {
	try {
		const pathname = new URL(url).pathname;
		const marcador = "/productos/";
		const indice = pathname.indexOf(marcador);
		return indice === -1 ? null : pathname.slice(indice + marcador.length);
	} catch {
		return null;
	}
};


export const crearProducto = async (req, res) => {
	const {
		nombre,
		descripcion,
		precio_base,
		cantidad_disponible,
		id_usuario,
		estado = "activo",
		embedding,
	} = req.body;

	if (!nombre || precio_base === undefined || precio_base === null) {
		return res
			.status(400)
			.json({ message: "Nombre y precio_base son obligatorios" });
	}

	const stockInicial = Number(cantidad_disponible);

	if (!Number.isInteger(stockInicial) || stockInicial < 0) {
	return res.status(400).json({
		message: "cantidad_disponible debe ser un entero >= 0",
		});
	}

	try {
		const { data: producto, error } = await supabase
			.from("producto")
			.insert([
				{
					nombre,
					descripcion,
					precio_base,
					estado,
					id_usuario,
					embedding,
				},
			])
			.select()
			.single();

			const { error: inventarioError } = await supabase
			.from("inventario")
			.insert({
				id_producto: producto.id_producto,
				cantidad_disponible: stockInicial,
				ultima_actualizacion: new Date().toISOString(),
			});

			

			if (inventarioError) {
			console.error("Error creando inventario:", inventarioError);
			return res.status(500).json({
				message: "Producto creado pero error al crear inventario",
			});
			}

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		console.log("BODY PRODUCTO:", req.body);

		return res.status(201).json({
			message: "Producto creado exitosamente",
			producto,
			inventario: {
				cantidad_disponible: stockInicial,
			}
		});
		
	} catch (error) {
		console.error("Error al crear producto:", error);
		return res.status(500).json({
			error: "Error interno del servidor",
		});
	}
};


export const obtenerProductos = async (req, res) => {
	try {
		const { data, error } = await supabase.from("producto").select("*");
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		return res.status(200).json({ productos: data });
	} catch (error) {
		console.error("Error al obtener productos:", error);
		return res.status(500).json({
			error: "Error interno del servidor",
		});
	}
};


export const editarProducto = async (req, res) => {
	const { id_producto } = req.params;
	const {
		nombre,
		descripcion,
		precio_base,
		estado,
		id_usuario,
		embedding,
	} = req.body;

	if (!id_producto) {
		return res.status(400).json({ message: "El id_producto del producto es obligatorio" });
	}

	const camposActualizables = {};
	if (nombre !== undefined) camposActualizables.nombre = nombre;
	if (descripcion !== undefined) camposActualizables.descripcion = descripcion;
	if (precio_base !== undefined) camposActualizables.precio_base = precio_base;
	if (estado !== undefined) camposActualizables.estado = estado;
	if (id_usuario !== undefined) camposActualizables.id_usuario = id_usuario;
	if (embedding !== undefined) camposActualizables.embedding = embedding;

	if (Object.keys(camposActualizables).length === 0) {
		return res.status(400).json({
			message: "No se proporcionaron campos para actualizar",
		});
	}

	try {
		const { data, error } = await supabase
			.from("producto")
			.update(camposActualizables)
			.eq("id_producto", id_producto)
			.select()
			.single();

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		if (!data) {
			return res.status(404).json({ message: "Producto no encontrado" });
		}

		return res.status(200).json({
			message: "Producto actualizado exitosamente",
			producto: data,
		});
	} catch (error) {
		console.error("Error al editar producto:", error);
		return res.status(500).json({
			error: "Error interno del servidor",
		});
	}
};


export const eliminarProducto = async (req, res) => {
	const { id_producto } = req.params;

	if (!id_producto) {
		return res
			.status(400)
			.json({ message: "El id_producto del producto es obligatorio" });
	}

	try {
		const { data: imagenes, error: obtenerImagenesError } = await supabase
			.from("producto_imagen")
			.select("url")
			.eq("id_producto", id_producto);
		if (obtenerImagenesError) {
			return res.status(400).json({ error: obtenerImagenesError.message });
		}

		const rutasAlmacenadas =
			imagenes
				?.map(({ url }) => extraerRutaObjeto(url))
				.filter(Boolean) ?? [];

		if (rutasAlmacenadas.length) {
			const { error: storageError } = await supabase.storage
				.from("productos")
				.remove(rutasAlmacenadas);
			if (storageError) {
				return res.status(400).json({ error: storageError.message });
			}
		}

		const { error: imagenError } = await supabase
			.from("producto_imagen")
			.delete()
			.eq("id_producto", id_producto);
		if (imagenError) {
			return res.status(400).json({ error: imagenError.message });
		}

		const { data, error } = await supabase
			.from("producto")
			.delete()
			.eq("id_producto", id_producto)
			.select()
			.single();

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		if (!data) {
			return res.status(404).json({ message: "Producto no encontrado" });
		}

		return res.status(200).json({
			message: "Producto eliminado exitosamente",
			producto: data,
		});
	} catch (error) {
		console.error("Error al eliminar producto:", error);
		return res.status(500).json({
			error: "Error interno del servidor",
		});
	}
};


export const obtenerImagenProducto = async (req, res) => {
	const { id_producto } = req.params;
	if (!id_producto) {
		return res.status(400).json({ message: "El id_producto es obligatorio" });
	}
	try {
		const { data, error } = await supabase
			.from("producto_imagen")
			.select("url")
			.eq("id_producto", id_producto)
			.order("id_imagen", { ascending: false })
			.limit(1)
			.single();
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		if (!data) {
			return res.status(404).json({ message: "Imagen no encontrada" });
		}
		return res.status(200).json({ url: data.url });
	} catch (err) {
		console.error("Error al obtener imagen de producto:", err);
		return res.status(500).json({ error: "Error interno del servidor" });
	}
};