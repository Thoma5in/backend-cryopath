import {supabase} from '../config/supabase.js'

export const listarNotificaciones = async (req, res) => {
    try {
        
        console.log('USER AUTH: ', req.user);
        const id_usuario = req.user.id; //Usuario autenticado

        

        const {data: notificaciones, error} = await supabase
        .from('notificacion')
        .select(`
            id_notificacion,
            tipo,
            id_producto,
            id_conversacion,
            leido,
            fecha
        `)
        .eq('id_usuario_destino', id_usuario)
        .order('fecha', {ascending: false});

        if (error) throw error;

        const unreadCount = notificaciones.filter(n => !n.leido).length;
        return res.json ({
            notificaciones,
            unreadCount
        });
    
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Error al listar las notificaciones',
            details: error.message,
        })
    }
}

export const marcarNotificacionLeida = async (req, res) => {
    try {
        const id_usuario = req.user.id; //Usuario autenticado
        const {id} = req.params; //ID de la notificación

        const { error } = await supabase
        .from('notificacion')
        .update({ leido: true })
        .eq('id_notificacion', id)
        .eq('id_usuario_destino', id_usuario);

        if (error) throw error; 

        return res.json({ message: 'Notificación marcada como leída' });
    } catch (error) {
        return res.status(500).json({
            error: 'Error al marcar la notificación como leída',
            details: error.message,
        })
    }
}

export const marcarTodasLeidas = async (req, res) => {
    try {
        const id_usuario = req.user.id; //Usuario autenticado


        const {error} = await supabase
        .from('notificacion')
        .update({leido: true})
        .eq('id_usuario_destino', id_usuario)
        .eq('leido', false)

        if (error) throw error;

        return res.json({message: 'Todas las notificaciones marcadas como leídas'});
    } catch (error) {
        return res.status(500).json({
            error: 'Error al marcar todas las notificaciones como leídas',
            details: error.message,
        })
    }
}