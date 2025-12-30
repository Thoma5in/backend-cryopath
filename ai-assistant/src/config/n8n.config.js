import dotenv from 'dotenv';

dotenv.config();

export const n8nConfig = {
  webhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/chat-ai',
  timeout: 30000, // 30 segundos
};
