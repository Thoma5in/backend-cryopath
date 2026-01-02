import supabase from '../config/supabase.js';

export const register = async (req, res) => {
    const { nombre, apellido, correo, password, direccion, telefono} = req.body;

    if (!nombre || !apellido || !correo || !password || !direccion || !telefono) {
        return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    try {
        // Crear usuario en Supabase Auth
        const {data: authData, error: authError} = await supabase.auth.admin.createUser({
            email: correo,
            password,
            email_confirm: true,
    })

    if (authError) {
        return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // Insertar datos adicionales en la tabla 'usuarios'
    const {error: dbError} = await supabase
    .from('usuario'  )
    .insert({
            id: userId,
            nombre,
            apellido,
            correo,
            direccion,
            estado: 'activo',
            telefono
        });

    //Asignar rol predeterminado 
    const { error: rolError} = await supabase
    .from('usuario_rol')
    .insert({
        id_usuario: userId,
        id_rol: 1 //usuario
    })

    if (rolError) {
        return res.status(400).json({ error: rolError.message });
    }


    if (dbError) {
        return res.status(400).json({ error: dbError.message });
    }

    return res.status(201).json({
        message: 'Usuario registrado exitosamente'
    })

    } catch (error) {
        return res.status(500).json({
            error: 'Error interno del servidor'
        })
    }

    
    

}

export const login = async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ message: 'Correo y password son obligatorios' });
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: correo,
            password,
        });

        if (error || !data?.user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const { data: perfilData, error: perfilError } = await supabase
            .from('usuario')
            .select('id, nombre, apellido, correo, telefono, direccion, estado')
            .eq('id', data.user.id)
            .single();

        if (perfilError) {
            return res.status(500).json({ error: perfilError.message });
        }

        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            user: data.user,
            usuario: perfilData,
            session: data.session,
        });
    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({
            error: 'Error interno del servidor',
        });
    }
};

export const checkEmailStatus = async (req, res) => {
	const { correo } = req.params;

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