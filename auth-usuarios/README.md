# Auth Usuarios - Servicio de Autenticación

Microservicio de autenticación y gestión de usuarios para la plataforma Cryopath. Maneja registro, login, roles de administrador y gestión de usuarios.

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
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=24h
```

## 🏃 Ejecutar

```bash
# Desarrollo
pnpm dev

# Producción
pnpm start
```

## 📡 Endpoints

### Autenticación
```
POST /api/auth/register          - Registrar nuevo usuario
POST /api/auth/login             - Iniciar sesión
POST /api/auth/logout            - Cerrar sesión
POST /api/auth/refresh-token     - Refrescar token JWT
```

### Gestión de Usuarios
```
GET  /api/usuarios               - Listar todos los usuarios
GET  /api/usuarios/:id           - Obtener datos de un usuario
PUT  /api/usuarios/:id           - Actualizar perfil de usuario
DELETE /api/usuarios/:id         - Eliminar usuario
```

### Administración
```
POST   /api/admin/usuarios       - Crear usuario (admin)
GET    /api/admin/usuarios       - Listar usuarios (admin)
PUT    /api/admin/usuarios/:id   - Actualizar usuario (admin)
DELETE /api/admin/usuarios/:id   - Eliminar usuario (admin)
```

## 🔐 Middleware

- **auth.middleware.js** - Valida JWT y autentica solicitudes
- **admin.middleware.js** - Verifica permisos de administrador
- **worker.middleware.js** - Procesa tareas en paralelo
- **responseTime.middleware.js** - Registra tiempo de respuesta

## 🏗️ Estructura del Proyecto

```
src/
├── app.js                    # Configuración de Express
├── server.js                 # Punto de entrada
├── config/
│   └── supabase.js          # Configuración de Supabase
├── controllers/
│   ├── auth.controller.js    # Lógica de autenticación
│   ├── usuario.controller.js # Gestión de usuarios
│   └── admin.controller.js   # Operaciones admin
├── middlewares/              # Middlewares personalizados
├── routes/
│   ├── auth.routes.js        # Rutas de autenticación
│   ├── usuario.routes.js     # Rutas de usuarios
│   └── admin.routes.js       # Rutas admin
```

## 📝 Notas

- Usa Supabase para almacenamiento y autenticación
- JWT se valida en cada solicitud protegida
- Los roles de admin se verifican para operaciones administrativas
- Las contraseñas se hashean antes de almacenarlas

## 🧪 Ejemplos

### Registrar usuario
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "nombre": "Jean Dupont"
  }'
```

### Iniciar sesión
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```
