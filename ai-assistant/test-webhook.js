import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, '.env') });

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

console.log('🧪 Test de conexión con n8n webhook\n');
console.log('📍 URL:', N8N_WEBHOOK_URL);
console.log('⏳ Enviando mensaje de prueba...\n');

const testMessage = {
  message: '¡Hola! Este es un mensaje de prueba desde el backend.',
  userId: 'test-user-123',
  conversationId: 'test-conversation-' + Date.now(),
  timestamp: new Date().toISOString(),
  metadata: {
    test: true,
    source: 'test-webhook.js'
  }
};

console.log('📤 Payload enviado:', JSON.stringify(testMessage, null, 2), '\n');

try {
  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testMessage),
    signal: AbortSignal.timeout(30000)
  });

  console.log('📊 Status:', response.status, response.statusText);
  console.log('📋 Headers:', Object.fromEntries(response.headers.entries()), '\n');

  if (!response.ok) {
    console.error('❌ Error: El webhook respondió con un error');
    const errorText = await response.text();
    console.error('Respuesta:', errorText);
    process.exit(1);
  }

  const data = await response.json();
  
  console.log('✅ ¡Éxito! Respuesta del webhook:');
  console.log(JSON.stringify(data, null, 2));
  console.log('\n🎉 El webhook de n8n está funcionando correctamente!');

} catch (error) {
  console.error('❌ Error al conectar con el webhook:');
  console.error('Tipo:', error.name);
  console.error('Mensaje:', error.message);
  
  if (error.name === 'TimeoutError') {
    console.error('\n⏰ El webhook tardó demasiado en responder (timeout de 30s)');
  } else if (error.cause) {
    console.error('Causa:', error.cause);
  }
  
  console.error('\n💡 Verifica que:');
  console.error('  1. La URL del webhook en .env sea correcta');
  console.error('  2. n8n esté corriendo en', N8N_WEBHOOK_URL?.split('/webhook')[0]);
  console.error('  3. El workflow en n8n esté activo');
  console.error('  4. No haya problemas de red o firewall');
  
  process.exit(1);
}
