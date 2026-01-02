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

