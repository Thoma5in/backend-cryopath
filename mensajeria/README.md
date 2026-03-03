# Mensajería - Servicio de Comunicación

Microservicio de mensajería y notificaciones para la plataforma Cryopath. Gestiona conversaciones en tiempo real, envío de mensajes y notificaciones a usuarios.

## 🚀 Instalación

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus configuraciones
```

## ⚙️ Configuración

Edita el archivo `.env`:

```env
PORT=3002
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret
```

## 🏃 Ejecutar

```bash
# Desarrollo
pnpm dev

# Producción
pnpm start
```

## 📡 Endpoints

### Conversaciones
```
GET    /api/conversaciones              - Listar conversaciones del usuario
POST   /api/conversaciones              - Crear nueva conversación
GET    /api/conversaciones/:id          - Obtener detalles de conversación
PUT    /api/conversaciones/:id          - Actualizar conversación
DELETE /api/conversaciones/:id          - Eliminar conversación
```

### Mensajes
```
GET    /api/mensajes/:conversacionId    - Obtener mensajes de conversación
POST   /api/mensajes                    - Enviar nuevo mensaje
PUT    /api/mensajes/:id                - Editar mensaje
DELETE /api/mensajes/:id                - Eliminar mensaje
```

### Notificaciones
```
GET    /api/notificaciones              - Obtener notificaciones del usuario
POST   /api/notificaciones              - Crear notificación
PUT    /api/notificaciones/:id          - Marcar como leída
DELETE /api/notificaciones/:id          - Eliminar notificación
```

## 🏗️ Estructura del Proyecto

```
src/
├── app.js                        # Configuración de Express
├── server.js                     # Punto de entrada
├── config/
│   └── supabase.js              # Configuración de Supabase
├── controllers/
│   ├── conversaciones.controller.js   # Gestión de conversaciones
│   ├── mensajes.controller.js         # Gestión de mensajes
│   └── notificaciones.controller.js   # Gestión de notificaciones
├── middlewares/
│   └── responseTime.middleware.js     # Registro de tiempo de respuesta
└── routes/
    ├── conversaciones.routes.js       # Rutas de conversaciones
    ├── mensajes.routes.js             # Rutas de mensajes
    └── notificaciones.routes.js       # Rutas de notificaciones
```

## ⚡ Características

- Conversaciones entre múltiples usuarios
- Mensajes en tiempo real
- Sistema de notificaciones
- Marcado de mensajes como leídos
- Soporte para archivos adjuntos (multer)

## 🧪 Ejemplos

### Crear conversación
```bash
curl -X POST http://localhost:3002/api/conversaciones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "participantes": ["user1", "user2"],
    "titulo": "Conversación importante"
  }'
```

### Enviar mensaje
```bash
curl -X POST http://localhost:3002/api/mensajes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "conversacionId": "conv_123",
    "contenido": "Hola, ¿cómo estás?"
  }'
```

### Obtener notificaciones
```bash
curl -X GET http://localhost:3002/api/notificaciones \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Notas

- Usa Supabase para almacenamiento de mensajes y conversaciones
- Multer se utiliza para manejo de archivos adjuntos
- Los mensajes se marcan automáticamente como leídos
- Las notificaciones se crean automáticamente para nuevos mensajes
