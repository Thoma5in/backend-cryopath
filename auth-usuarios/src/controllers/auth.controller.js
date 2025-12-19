import supabase from '../config/supabase.js';

export const register = async (req, res) => {
    const { nombre, apellido, correo, password, direccion} = req.body;

    if (!nombre || !apellido || !correo || !password || !direccion) {
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
        });

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