import supabase from '../config/supabase.js';

export const getCurrentUsuario = async (req, res) => {
	const userId = req.user?.id;

	if (!userId) {
		return res.status(401).json({ message: 'No autorizado' });
	}

	try {
		const { data, error } = await supabase
			.from('usuario')
			.select('id, nombre, apellido, correo, telefono, direccion, estado')
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

export const updateUsuario = async (req, res) => {
	try {
		const { nombre, apellido, direccion, telefono } = req.body
		const user = req.user

		const { data, error } = await supabase
		.from('usuario')
		.update({ nombre, apellido, direccion, telefono })
		.eq('id', user.id)
		.select()
		.single()

		if (error) {
			return res.status(500).json({ error: error.message });
		}

		res.json(data)
	} catch (error) {
		res.status(500).json({ error: 'Error interno del servidor' });
	}
}

export const deleteUsuario = async (req, res) => {
	const userId = req.user.id;

	try {
		const { error } = await supabase
		.from('usuario')
		.update({ estado: 'inactivo' })
		.eq('id', userId)

		if (error) throw error

		return res.status(200).json({
			message: 'Usuario desactivado correctamente'
		})
	} catch (error) {
		return res.status(500).json({
			message: "Error al desactivar el usuario",
		})

	}
}


export const checkEmailStatus = async (req, res) => {
	const { correo } = req.body;

	if (!correo) {
		return res.status(400).json({ message: 'Correo electrónico es requerido' });
	}

	const {data, error} = await supabase
	.from('usuario')
	.select('id, estado')
	.eq('correo', correo)
	.single();

	if (error && error.code !== 'PGRST116') {
		return res.status(500).json({ message: 'Error al verificar el correo electrónico' });
	}

	//No existe
	if (!data) {
		return res.status(200).json({ exists: false });
	}

	//Existe
	return res.status(200).json({ exists: true, estado: data.estado });
}

export const reactivateAccount = async (req, res) => {
  const { correo } = req.body

  if (!correo) {
    return res.status(400).json({ message: 'Correo requerido' })
  }

  const { error } = await supabase
    .from('usuario')
    .update({ estado: 'activo' })
    .eq('correo', correo)

  if (error) {
    return res.status(500).json({ message: 'No se pudo reactivar la cuenta' })
  }

  return res.status(200).json({
    message: 'Cuenta reactivada correctamente',
  })
}
