import supabase from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Token no proporcionado' });
	}

	const token = authHeader.split(' ')[1];

	try {
		const { data, error } = await supabase.auth.getUser(token);

		if (error || !data?.user) {
			return res.status(401).json({ message: 'Token inválido' });
		}

		const { data:usuarioData, error:usuarioError } = await supabase
		.from('usuario')
		.select('estado')
		.eq('id', data.user.id)
		.single();

		if (usuarioError || !usuarioData) {
      		return res.status(403).json({ message: 'Usuario no encontrado' })
    	}

		if (usuarioData.estado !== 'activo') {
			return res.status(403).json({ message: 'Cuenta inactiva' })
		}

		// Obtener roles del usuario
		const { data: rolesData, error: rolesError } = await supabase
			.from('usuario_rol')
			.select('rol(nombre)')
			.eq('id_usuario', data.user.id);

			

		if (rolesError) {
			return res.status(500).json({ error: rolesError.message });
		}

		const roles = rolesData.map(r => r.rol.nombre);

		req.user = {...data.user, roles};
		
		next();
	} catch (err) {
		return res.status(500).json({ error: 'Error interno del servidor' });
	}
};
