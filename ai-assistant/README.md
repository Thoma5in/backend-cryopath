# AI Assistant - Servicio de Chat con IA

Microservicio para integración con workflows de n8n, permitiendo chat de IA en la plataforma Cryopath.

## 🚀 Instalación

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tu URL de n8n
```

## ⚙️ Configuración

Edita el archivo `.env`:

```env
PORT=3004
N8N_WEBHOOK_URL=http://localhost:5678/webhook/chat-ai
```

## 🏃 Ejecutar

```bash
# Desarrollo
pnpm dev

# Producción
pnpm start
```

## 📡 Endpoints

### Enviar mensaje al chat
```http
POST /api/chat/message
Content-Type: application/json

{
  "message": "Hola, ¿cómo estás?",
  "userId": "user123",
  "conversationId": "conv_123", // opcional
  "metadata": { // opcional
    "source": "web",
    "language": "es"
  }
}
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "response": "¡Hola! Estoy bien, ¿en qué puedo ayudarte?",
    "conversationId": "conv_123",
    "timestamp": "2025-12-30T10:30:00.000Z"
  }
}
```

### Obtener historial de conversación
```http
GET /api/chat/history/:conversationId
```

### Webhook para recibir respuestas de n8n (opcional)
```http
POST /api/chat/webhook
```

## 🔧 Configuración de n8n

1. En n8n, crea un nuevo workflow
2. Añade un nodo **Webhook** con:
   - Método: POST
   - Ruta: `/webhook/chat-ai`
3. Añade tu lógica de IA (OpenAI, Anthropic, etc.)
4. Retorna la respuesta en formato:
   ```json
   {
     "response": "respuesta del AI",
     "conversationId": "{{$json.conversationId}}"
   }
   ```

### Ejemplo de workflow n8n básico:

```
Webhook → OpenAI Chat → Respond to Webhook
```

## 🧪 Probar

```bash
# Test básico
curl -X POST http://localhost:3004/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola"}'
```

## 📝 Notas

- El microservicio espera que el webhook de n8n devuelva JSON
- Puedes personalizar el timeout en `n8n.config.js`
- Los IDs de conversación se generan automáticamente si no se proporcionan
