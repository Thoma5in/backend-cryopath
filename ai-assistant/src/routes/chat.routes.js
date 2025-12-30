import { Router } from 'express';
import { 
  sendMessage, 
  getConversationHistory, 
  receiveWebhook 
} from '../controllers/chat.controller.js';

const router = Router();

/**
 * @route   POST /api/chat/message
 * @desc    Envía un mensaje al workflow de n8n
 * @body    { message, userId?, conversationId?, metadata? }
 */
router.post('/message', sendMessage);

/**
 * @route   GET /api/chat/history/:conversationId
 * @desc    Obtiene el historial de una conversación
 */
router.get('/history/:conversationId', getConversationHistory);

/**
 * @route   POST /api/chat/webhook
 * @desc    Recibe respuestas del workflow de n8n (opcional)
 */
router.post('/webhook', receiveWebhook);

export default router;
