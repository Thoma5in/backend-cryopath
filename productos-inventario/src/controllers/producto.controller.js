import { supabase } from "../config/supabase.js";


export const crearProducto = async (req, res) => {
	const {
		nombre,
		descripcion,
		precio_base,
		id_usuario,
		estado = "activo",
		embedding,
	} = req.body;

	if (!nombre || precio_base === undefined || precio_base === null) {
		return res
			.status(400)
			.json({ message: "Nombre y precio_base son obligatorios" });
	}

	try {
		const { data, error } = await supabase
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

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		return res.status(201).json({
			message: "Producto creado exitosamente",
			producto: data,
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