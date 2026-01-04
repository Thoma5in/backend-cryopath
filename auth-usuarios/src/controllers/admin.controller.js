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
    .select('id, correo, nombre, apellido')

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