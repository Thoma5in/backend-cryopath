import supabase from "../config/supabase.js";

export const adminDashboard = async (req, res) => {
  res.json({
    message: 'Bienvenido al panel de administrador',
    user: {
      id: req.user.id,
      email: req.user.email,
      roles: req.user.roles
    }
  });
};

export const asignarRol = async (req, res) => {
  const { id_usuario, id_rol } = req.body;

  if (!id_usuario || !id_rol) {
    return res.status(400).json({ message: 'id_usuario o id_rol son necesarios' });
  }

  try {
    //Verificar si ya tiene rol
    const { data: existing, error: existError } = await supabase
    .from('usuario_rol')
    .select('id_rol')
    .eq('id_usuario', id_usuario)
    .eq('id_rol', id_rol)
    .maybeSingle();

    if (existError) throw existError;

    if (existing) {
      return res.status(409).json({ message: 'El usuario ya tiene este rol asignado' });
    }

    // Insertar rol
    const {error: insertError } = await supabase
    .from('usuario_rol')
    .insert({ id_usuario, id_rol });

    if (insertError) throw insertError;

    res.json({
      message: 'Rol asignado correctamente'
    })
  } catch (err) {
    console.error('Error asignando rol:', err); 
    res.status(500).json({
      message: 'Error asignando rol al usuario'
    })
  }
}

export const listarUsuarios = async (req, res) => {
  try {
    const {data, error} = await supabase
    .from('usuario')
    .select('id, correo, nombre, apellido, estado')

    if (error) throw error

    res.json(data)
  } catch (err) {
    res.status(500).json({
      message: 'Error obteniendo usuarios'
    })
  }
}

export const listarRoles = async (req, res) => {
  try {
    const {data, error} = await supabase
    .from('rol')
    .select('id_rol, nombre')

    if (error) throw error

    res.json(data)
  } catch (err) {
    console.error('Error obteniendo roles:', err);
    res.status(500).json({
      message: 'Error obteniendo roles'
    })
  }
}

export const cambiarEstadoUsuario = async (req, res) => {
  const { id_usuario, estado } = req.body;

  if (typeof id_usuario === 'undefined' || typeof estado === 'undefined') {
    return res.status(400).json({ message: 'id_usuario y estado son necesarios' });
  }

  try {
    const { error } = await supabase
      .from('usuario')
      .update({ estado })
      .eq('id', id_usuario);

    if (error) throw error;

    res.json({ message: 'Estado del usuario actualizado correctamente' });
  } catch (err) {
    console.error('Error cambiando estado del usuario:', err);
    res.status(500).json({ message: 'Error cambiando estado del usuario' });
  }
}


export const eliminarUsuario = async (req, res) => {
  const { id_usuario } = req.params;

  if (!id_usuario) {
    return res.status(400).json({ message: 'id_usuario es necesario' });
  }

  try {
    // Verificar Usuario
    const { data: usuario, error: usuarioError } = await supabase
    .from('usuario')
    .select('id')
    .eq('id', id_usuario)
    .single()

    if (usuarioError || !usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Eliminar roles
    const {error: rolesError } = await supabase
    .from('usuario_rol')
    .delete()
    .eq('id_usuario', id_usuario);

    if (rolesError) throw rolesError;

    // Eliminar usuario (tabla usuario)
    const {error:deleteUserError} = await supabase
    .from('usuario')
    .delete()
    .eq('id', id_usuario)

    if (deleteUserError) throw deleteUserError;

    //Eliminar usuario de Auth de Supabase
    const { error: authError } = await supabase.auth.admin.deleteUser(id_usuario);

    if (authError) throw authError;

    return res.json({ message: 'Usuario eliminado correctamente' });



    
  } catch (err) {
    console.error('Error eliminando usuario:', err); 
    return res.status(500).json({ message: 'Error eliminando usuario' });
  }
}