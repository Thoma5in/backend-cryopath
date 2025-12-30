import { n8nConfig } from '../config/n8n.config.js';

/**
 * Envía un mensaje al workflow de n8n
 */
export const sendMessage = async (req, res) => {
  try {
    const { message, userId, conversationId, metadata } = req.body;

    // Validación básica
    if (!message) {
      return res.status(400).json({ 
        error: 'El mensaje es requerido' 
      });
    }

    // Preparar payload para n8n
    const payload = {
      message,
      userId: userId || 'anonymous',
      conversationId: conversationId || generateConversationId(),
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    };

    // Enviar al webhook de n8n
    const response = await fetch(n8nConfig.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(n8nConfig.timeout)
    });

    if (!response.ok) {
      throw new Error(`Error del webhook n8n: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      data: {
        response: data.response || data.message || data,
        conversationId: payload.conversationId,
        timestamp: payload.timestamp
      }
    });

  } catch (error) {
    console.error('Error al enviar mensaje a n8n:', error);
    
    res.status(500).json({ 
      error: 'Error al procesar el mensaje',
      details: error.message 
    });
  }
};

/**
 * Obtiene el historial de conversación (implementar según necesites)
 */
export const getConversationHistory = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Aquí podrías implementar lógica para guardar/recuperar historial
    // Por ahora retornamos un mensaje básico
    res.json({
      success: true,
      message: 'Funcionalidad de historial pendiente de implementar',
      conversationId
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ 
      error: 'Error al obtener historial',
      details: error.message 
    });
  }
};

/**
 * Webhook para recibir respuestas de n8n (opcional)
 */
export const receiveWebhook = async (req, res) => {
  try {
    const data = req.body;
    
    console.log('Webhook recibido de n8n:', data);
    
    // Procesar la respuesta según tu lógica
    // Podrías guardar en BD, enviar notificación, etc.
    
    res.json({ 
      success: true, 
      received: true 
    });

  } catch (error) {
    console.error('Error al procesar webhook:', error);
    res.status(500).json({ 
      error: 'Error al procesar webhook',
      details: error.message 
    });
  }
};

// Función auxiliar para generar ID de conversación
const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};
