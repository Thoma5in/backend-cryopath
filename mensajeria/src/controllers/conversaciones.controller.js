import {supabase} from '../config/supabase.js';

export const crearConversacion = async (req, res) => {
    try {
        const {id_producto, mensaje} = req.body;
        const id_usuario = req.user.id; //Usuario autenticado

        if(!id_producto || !mensaje) {
            return res.status(400).json({error: 'Faltan datos obligatorios'});
        }

        //Obtener producto y dueño
        const {data:producto, error:productoError} = await supabase
        .from('producto')
        .select('id_usuario')
        .eq('id_producto', id_producto)
        .single()

        if (productoError || !producto) {
            return res.status(404).json({error: 'Producto no encontrado'});
        }

        const id_usuario_producto = producto.id_usuario;

        //Evitar preguntarse a sí mismo
        if(id_usuario === id_usuario_producto) {
            return res.status(400).json({error: 'No puedes iniciar una conversación contigo mismo'});
        }

        //Buscar conversación existente
        let {data: conversacion} = await supabase
        .from('conversacion')
        .select('id_conversacion')
        .eq('id_producto', id_producto)
        .eq('id_usuario_pregunta', id_usuario)
        .single()

        let id_conversacion

        //Crear conversación si no existe
        if(!conversacion) {
            const {data: nuevaConversacion, error: convError} = await supabase
            .from('conversacion')
            .insert({
                id_producto,
                id_usuario_pregunta: id_usuario,
                id_usuario_producto
            })
            .select()
            .single()

            if(convError) throw convError

            id_conversacion = nuevaConversacion.id_conversacion
        } else {
            id_conversacion = conversacion.id_conversacion
        }

        //Insertar mensaje
        const {error: mensajeError} = await supabase
        .from('mensaje')
        .insert({
            id_conversacion,
            id_usuario_emisor: id_usuario,
            contenido: mensaje
        })

        if (mensajeError) throw mensajeError

        //Crear Notificación
        await supabase
        .from('notificacion')
        .insert({
            id_usuario_destino: id_usuario_producto,
            tipo: 'pregunta',
            id_conversacion, 
            id_producto
        })

        return res.status(201).json({message: 'Conversación y mensaje creados exitosamente', id_conversacion}); 
    } catch (error) {
        console.error(error)
        return res.status(500).json({error: 'Error al crear la conversación o el mensaje', details: error.message});
    }
}

export const listarConversaciones = async (req, res) => {
    try {
        const id_usuario = req.user.id;

        const {data, error} = await supabase
        .from('conversacion')
         .select(`
            id_conversacion,
            created_at,
            producto (
            id_producto,
            nombre
            ),
            id_usuario_pregunta,
            id_usuario_producto,
            mensaje (
            contenido,
            created_at,
            id_usuario_emisor
            )
        `)
        .or (
            `id_usuario_pregunta.eq.${id_usuario},id_usuario_producto.eq.${id_usuario}`
        )
        .order('created_at', { foreignTable: 'mensaje', ascending: false })

        if(error) throw error

        //Procesar para dejar solo el último mensaje
        const conversaciones = data.map(conv => {
            const ultimoMensaje = conv.mensaje?.[0] || null;

            return {
                id_conversacion: conv.id_conversacion,
                producto: conv.producto,
                ultimo_mensaje: ultimoMensaje?.contenido || null,
                fecha_ultimo_mensaje: ultimoMensaje?.created_at || conv.created_at,
                rol:
                conv.id_usuario_pregunta === id_usuario
                ? 'comprador'
                : 'vendedor'
            }
        })

        return res.json(conversaciones);
    } catch (error) {
        console.error(error)
        return res.status(500).json({error: 'Error al listar las conversaciones', details: error.message});
    }
}

export const obtenerConversacion = async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const id_conversacion = req.params.id;

        //Obtener conversación y validar pertenencia
        const { data: conversacion, error: convError } = await supabase
        .from('conversacion')
        .select(`
            id_conversacion,
            id_usuario_pregunta,
            id_usuario_producto,
            producto:producto (
            id_producto,
            nombre
            ),
            usuario_pregunta:usuario!conversacion_usuario_pregunta_fk (
            id,
            nombre,
            apellido
            ),
            usuario_producto:usuario!conversacion_usuario_producto_fk (
            id,
            nombre,
            apellido
            )
        `)
        .eq('id_conversacion', id_conversacion)
        .single();

        console.log('CONV ERROR:', convError);
        console.log('CONVERSACION:', conversacion);

        const otroUsuario =
        id_usuario === conversacion.id_usuario_pregunta
            ? conversacion.usuario_producto
            : conversacion.usuario_pregunta;

        if (convError || !conversacion) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }

        const esParticipante =
        conversacion.id_usuario_pregunta === id_usuario || conversacion.id_usuario_producto === id_usuario;

        if (!esParticipante) {
            return res.status(403).json({ error: 'Acceso denegado a esta conversación' });
        }

        //Obtener mensajes
        const { data: mensajes, error: msgError } = await supabase
        .from('mensaje')
        .select(`
            id_mensaje,
            contenido,
            fecha_envio,
            id_usuario_emisor
        `)
        .eq('id_conversacion', id_conversacion)
        .order('fecha_envio', { ascending: true });
        if (msgError) throw msgError;

        return res.json({
        conversacion: {
            id_conversacion: conversacion.id_conversacion,
            producto: conversacion.producto,
            otro_usuario: otroUsuario
        },
        mensajes
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
        error: 'Error al obtener la conversación',
        details: error.message
        });
    }
}

export const marcarMensajesLeidos = async (req, res) => {
    try {
        const id_usuario = req.user.id;
        const id_conversacion = req.params.id;

        //Validar pertenencia
        const {data: conversacion, error: convError} = await supabase
        .from('conversacion')
        .select('id_usuario_pregunta, id_usuario_producto')
        .eq('id_conversacion', id_conversacion)
        .single()

        if (convError || !conversacion) {
            return res.status(404).json({ error: 'Conversación no encontrada' });
        }

        const esParticipante = 
        conversacion.id_usuario_pregunta === id_usuario ||
        conversacion.id_usuario_producto === id_usuario;

        if (!esParticipante) {
            return res.status(403).json({ error: 'No tienes acceso a esta conversación' });
        }

        //Marcar mensajes como leídos SOLO los mensajes del otro usuario
        const { error} = await supabase
        .from('mensaje')
        .update({leido: true})
        .eq('id_conversacion', id_conversacion)
        .neq('id_usuario_emisor', id_usuario)
        .eq('leido', false);
        
        if (error) throw error;

        return res.json({message: 'Mensajes marcados como leídos'});
    } catch (error) {
        console.error(error)
        return res.status(500).json({error: 'Error al marcar los mensajes como leídos', details: error.message});
    }
}

export const contarNoLeidos = async (req, res) => {
    try {
        const id_usuario = req.user.id;

        const {count, error} = await supabase
        .from('mensaje')
        .select('id_mensaje', {count: 'exact', head: true})
        .eq('leido', false)
        .neq('id_usuario_emisor', id_usuario)
        .in(
            'id_conversacion',
            supabase
            .from('conversacion')
            .select('id_conversacion')
            .or (
                 `id_usuario_pregunta.eq.${id_usuario},id_usuario_producto.eq.${id_usuario}`
            )
        )

        if (error) throw error;

        return res.json({no_leidos: count || 0});    
    } catch (error) {
        console.error(error)
        return res.status(500).json({error: 'Error al contar los mensajes no leídos', details: error.message});
    }
}