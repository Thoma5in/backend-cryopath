import { supabase } from '../config/supabase.js';

export const enviarMensaje = async (req, res) => {
  try {
    const id_usuario = req.user.id;
    const { id_conversacion, contenido } = req.body;

    if (!id_conversacion || !contenido) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    //Validar conversación y pertenencia
    const { data: conversacion, error: convError } = await supabase
      .from('conversacion')
      .select(`
        id_conversacion,
        id_usuario_pregunta,
        id_usuario_producto,
        id_producto
      `)
      .eq('id_conversacion', id_conversacion)
      .single();

    if (convError || !conversacion) {
      return res.status(404).json({ error: 'Conversación no encontrada' });
    }

    const esParticipante =
      conversacion.id_usuario_pregunta === id_usuario ||
      conversacion.id_usuario_producto === id_usuario;

    if (!esParticipante) {
      return res.status(403).json({ error: 'No tienes acceso a esta conversación' });
    }

    //Insertar mensaje
    const { data: nuevoMensaje, error: msgError } = await supabase
      .from('mensaje')
      .insert({
        id_conversacion,
        id_usuario_emisor: id_usuario,
        contenido
      })
      .select()
      .single();

    if (msgError) throw msgError;

    //Determinar receptor
    const id_usuario_destino =
      id_usuario === conversacion.id_usuario_pregunta
        ? conversacion.id_usuario_producto
        : conversacion.id_usuario_pregunta;

    //Crear notificación
    await supabase
      .from('notificacion')
      .insert({
        id_usuario_destino,
        tipo: 'mensaje',
        id_conversacion,
        id_producto: conversacion.id_producto
      });

    return res.status(201).json({
      message: 'Mensaje enviado',
      mensaje: nuevoMensaje
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Error al enviar el mensaje',
      details: error.message
    });
  }
};