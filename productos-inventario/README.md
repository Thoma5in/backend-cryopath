# Productos e Inventario - Servicio de Catálogo

Microservicio de gestión de productos, inventario, categorías y promociones para la plataforma Cryopath. Incluye sistema de caché con Redis y manejo de reseñas.

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
PORT=3005
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Storage
SUPABASE_STORAGE_BUCKET=productos
MAX_FILE_SIZE=5242880  # 5MB
```

## 🏃 Ejecutar

```bash
# Desarrollo
pnpm dev

# Producción
pnpm start
```

## 📡 Endpoints

### Productos
```
GET    /api/productos                   - Listar todos los productos
POST   /api/productos                   - Crear nuevo producto (admin)
GET    /api/productos/:id               - Obtener detalles del producto
PUT    /api/productos/:id               - Actualizar producto (admin)
DELETE /api/productos/:id               - Eliminar producto (admin)
GET    /api/productos/buscar/:termino   - Buscar productos
```

### Categorías
```
GET    /api/categorias                  - Listar categorías
POST   /api/categorias                  - Crear categoría (admin)
GET    /api/categorias/:id              - Obtener categoría
PUT    /api/categorias/:id              - Actualizar categoría (admin)
DELETE /api/categorias/:id              - Eliminar categoría (admin)
```

### Supercategorías
```
GET    /api/supercategorias             - Listar supercategorías
POST   /api/supercategorias             - Crear supercategoría (admin)
GET    /api/supercategorias/:id         - Obtener supercategoría
PUT    /api/supercategorias/:id         - Actualizar supercategoría (admin)
DELETE /api/supercategorias/:id         - Eliminar supercategoría (admin)
```

### Inventario
```
GET    /api/inventario/:productoId      - Obtener inventario
POST   /api/inventario                  - Actualizar stock (admin)
GET    /api/inventario/bajo-stock       - Productos con bajo stock
```

### Reseñas
```
GET    /api/resenas/:productoId         - Obtener reseñas del producto
POST   /api/resenas                     - Crear reseña
PUT    /api/resenas/:id                 - Actualizar reseña
DELETE /api/resenas/:id                 - Eliminar reseña
```

### Promociones
```
GET    /api/promociones                 - Listar promociones activas
POST   /api/promociones                 - Crear promoción (admin)
GET    /api/promociones/:id             - Obtener promoción
PUT    /api/promociones/:id             - Actualizar promoción (admin)
DELETE /api/promociones/:id             - Eliminar promoción (admin)
```

### Storage de Productos
```
POST   /api/storage/productos/upload    - Cargar imagen de producto
DELETE /api/storage/productos/:nombre   - Eliminar imagen
GET    /api/storage/productos/:nombre   - Obtener imagen
```

## 🏗️ Estructura del Proyecto

```
src/
├── app.js                              # Configuración de Express
├── server.js                           # Punto de entrada
├── config/
│   ├── supabase.js                    # Configuración de Supabase
│   └── redis.js                       # Configuración de Redis
├── controllers/
│   ├── producto.controller.js         # Gestión de productos
│   ├── categorias.controller.js       # Gestión de categorías
│   ├── supercategorias.controller.js  # Gestión de supercategorías
│   ├── inventario.controller.js       # Control de inventario
│   ├── resenas.controller.js          # Gestión de reseñas
│   ├── promociones.controller.js      # Gestión de promociones
│   ├── producto.categorias.controller.js  # Relación producto-categorías
│   └── storageProductos.controller.js     # Subida y gestión de archivos
├── middlewares/
│   └── responseTime.middleware.js     # Registro de tiempo de respuesta
├── routes/
│   ├── productos.routes.js            # Rutas de productos
│   ├── categorias.routes.js           # Rutas de categorías
│   ├── supercategorias.routes.js      # Rutas de supercategorías
│   ├── inventario.routes.js           # Rutas de inventario
│   ├── resenas.routes.js              # Rutas de reseñas
│   ├── promociones.routes.js          # Rutas de promociones
│   ├── producto.categorias.routes.js  # Rutas de relaciones
│   └── storageProductos.routes.js     # Rutas de almacenamiento
└── services/
    └── cache.service.js               # Servicio de caché con Redis
```

## ⚡ Características

- **Caché con Redis**: Mejora de rendimiento en consultas frecuentes
- **Sistema de categorías jerárquicas**: Supercategorías y subcategorías
- **Gestión de inventario**: Control de stock y alertas
- **Sistema de reseñas**: Valoraciones y comentarios de usuarios
- **Promociones**: Descuentos y ofertas especiales
- **Carga de imágenes**: Integración con Supabase Storage
- **Búsqueda de productos**: Búsqueda por términos
- **API completa**: CRUD para todos los recursos

## 🚀 Caché con Redis

El servicio utiliza Redis para cachear:
- Productos frecuentemente solicitados
- Categorías y supercategorías
- Promociones activas
- Resultados de búsqueda

```javascript
// Ejemplo: Las consultas se cachean automáticamente
GET /api/productos  // Primera llamada: consulta BD y cachea resultado
GET /api/productos  // Llamadas posteriores: obtienen del caché
```

## 🧪 Ejemplos

### Crear producto
```bash
curl -X POST http://localhost:3005/api/productos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nombre": "Nitrógeno Líquido - 5L",
    "descripcion": "Nitrógeno líquido de grado industrial",
    "precio": 49.99,
    "stock": 100,
    "categoriaId": "cat_123"
  }'
```

### Crear categoría
```bash
curl -X POST http://localhost:3005/api/categorias \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nombre": "Gases Criogénicos",
    "descripcion": "Productos criogénicos y refrigeriantes",
    "supercategoriaId": "super_1"
  }'
```

### Cargar imagen de producto
```bash
curl -X POST http://localhost:3005/api/storage/productos/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "imagen=@producto.jpg" \
  -F "productoId=prod_123"
```

### Crear reseña
```bash
curl -X POST http://localhost:3005/api/resenas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productoId": "prod_123",
    "calificacion": 5,
    "comentario": "Excelente producto, entrega rápida"
  }'
```

### Crear promoción
```bash
curl -X POST http://localhost:3005/api/promociones \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "nombre": "Black Friday",
    "descuento": 20,
    "productoId": "prod_123",
    "fechaInicio": "2026-11-24",
    "fechaFin": "2026-11-30"
  }'
```

## 📝 Notas

- Usa Supabase para almacenamiento de datos y archivos
- Redis cachea automáticamente las consultas frecuentes
- El caché se invalida al actualizar o eliminar productos
- Multer maneja la subida de imágenes
- Las imágenes se almacenan en Supabase Storage
- El inventario se valida antes de permitir compras
