import supabase from '../config/supabase.js';

export const register = async (req, res) => {
    const { nombre, apellido, correo, password, direccion, telefono} = req.body;

    if (!nombre || !apellido || !correo || !password || !direccion || !telefono) {
        return res.status(400).json({ message: 'Por favor completa todos los datos requeridos para crear tu cuenta.' });
    }

    try {
        // Crear usuario en Supabase Auth
        const {data: authData, error: authError} = await supabase.auth.admin.createUser({
            email: correo,
            password,
            email_confirm: true,
    })

    if (authError) {
        return res.status(400).json({ error: 'No pudimos crear tu cuenta en este momento. Revisa el correo y la contraseña o inténtalo de nuevo en unos minutos.' });
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
        return res.status(400).json({ error: 'Tu usuario se creó, pero no pudimos asignar el rol. Intenta iniciar sesión y, si ves problemas, contáctanos.' });
    }


    if (dbError) {
        return res.status(400).json({ error: 'Tu cuenta se creó, pero no pudimos guardar todos tus datos. Intenta nuevamente o contáctanos para ayudarte.' });
    }

    return res.status(201).json({
        message: 'Tu cuenta se creó correctamente. ¡Ya puedes iniciar sesión!'
    })

    } catch (error) {
        return res.status(500).json({
            error: 'Algo salió mal mientras creábamos tu cuenta. Inténtalo de nuevo en unos minutos.'
        })
    }
}

export const login = async (req, res) => {
    const { correo, password } = req.body;

    if (!correo || !password) {
        return res.status(400).json({ message: 'Necesitamos tu correo y contraseña para ingresar.' });
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: correo,
            password,
        });

        if (error || !data?.user) {
            return res.status(401).json({ message: 'No pudimos iniciar sesión. Revisa tu correo y contraseña e inténtalo otra vez.' });
        }

        const { data: perfilData, error: perfilError } = await supabase
            .from('usuario')
            .select('id, nombre, apellido, correo, telefono, direccion, estado')
            .eq('id', data.user.id)
            .single();

        if (perfilError) {
            return res.status(500).json({ error: 'Iniciaste sesión, pero no pudimos cargar tu perfil. Recarga la página o vuelve a intentar en un momento.' });
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
            error: 'Ocurrió un problema para iniciar sesión. Inténtalo de nuevo en unos minutos.',
        });
    }
};