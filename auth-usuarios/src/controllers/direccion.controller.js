import supabase from '../config/supabase.js'

export const crearDireccion = async (req, res) => {
    try {
        const {nombre_direccion, direccion, ciudad, referencia} = req.body
        const id_usuario = req.user.id

        const {data, error} = await supabase
        .from('usuario_direccion')
        .insert([
            {
                id_usuario,
                nombre_direccion,
                direccion,
                ciudad,
                referencia
            }
        ])
        .select()

        if(error) throw error

        res.status(201).json(data)

    } catch (error) {
        res.status(500).json({ error: 'Error al crear dirección', error: error.message });
    }
}

export const obtenerDirecciones = async (req, res) => {
    try {

        const id_usuario = req.user.id

        const {data, error} = await supabase
        .from('usuario_direccion')
        .select('*')
        .eq('id_usuario', id_usuario)

        if (error) throw error

        res.json(data)
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener direcciones', error: error.message });
    }


}