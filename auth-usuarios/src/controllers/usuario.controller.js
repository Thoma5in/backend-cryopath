import supabase from '../config/supabase.js';

export const getCurrentUsuario = async (req, res) => {
	const userId = req.user?.id;

	if (!userId) {
		return res.status(401).json({ message: 'No autorizado' });
	}

	try {
		const { data, error } = await supabase
			.from('usuario')
			.select('id, nombre, apellido, correo, direccion, estado')
			.eq('id', userId)
			.single();

		if (error?.code === 'PGRST116') {
			return res.status(404).json({ message: 'Usuario no encontrado' });
		}

		if (error) {
			return res.status(500).json({ error: error.message });
		}

		return res.status(200).json({ usuario: data });
	} catch (err) {
		return res.status(500).json({ error: 'Error interno del servidor' });
	}
};
