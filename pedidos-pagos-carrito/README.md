# Pedidos, Pagos y Carrito - Servicio de E-Commerce

Microservicio para gestionar carrito de compras, pagos y pedidos de la plataforma Cryopath. Integra PayPal para procesamiento de pagos.

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
PORT=3003
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-jwt-secret

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox  # o production
```

## 🏃 Ejecutar

```bash
# Desarrollo
pnpm dev

# Producción
pnpm start
```

## 📡 Endpoints

### Carrito
```
GET    /api/carrito                     - Obtener carrito del usuario
POST   /api/carrito                     - Añadir producto al carrito
PUT    /api/carrito/:productoId         - Actualizar cantidad en carrito
DELETE /api/carrito/:productoId         - Eliminar producto del carrito
DELETE /api/carrito                     - Vaciar carrito
```

### Pedidos
```
GET    /api/pedidos                     - Listar pedidos del usuario
POST   /api/pedidos                     - Crear nuevo pedido
GET    /api/pedidos/:id                 - Obtener detalles del pedido
PUT    /api/pedidos/:id                 - Actualizar estado del pedido
DELETE /api/pedidos/:id                 - Cancelar pedido
```

### Pagos (PayPal)
```
POST   /api/pagos/crear-transaccion     - Iniciar transacción PayPal
POST   /api/pagos/confirmar             - Confirmar y procesar pago
GET    /api/pagos/:transaccionId        - Obtener estado del pago
```

### Órdenes
```
GET    /api/ordenes                     - Listar órdenes
POST   /api/ordenes                     - Crear orden
GET    /api/ordenes/:id                 - Obtener orden
PUT    /api/ordenes/:id                 - Actualizar orden
DELETE /api/ordenes/:id                 - Eliminar orden
```

## 🏗️ Estructura del Proyecto

```
src/
├── app.js                        # Configuración de Express
├── server.js                     # Punto de entrada
├── config/
│   ├── supabase.js              # Configuración de Supabase
│   └── paypal.js                # Configuración de PayPal
├── controllers/
│   ├── carrito.controller.js     # Gestión del carrito
│   ├── pedidos.controller.js     # Gestión de pedidos
│   ├── pagos.controller.js       # Integración PayPal
│   └── orden.controller.js       # Gestión de órdenes
├── middlewares/
│   └── responseTime.middleware.js    # Registro de tiempo de respuesta
└── routes/
    ├── carrito.routes.js         # Rutas de carrito
    ├── pedidos.routes.js         # Rutas de pedidos
    ├── pagos.routes.js           # Rutas de pagos
    └── orden.routes.js           # Rutas de órdenes
```

## 💳 Integración PayPal

El servicio utiliza la API REST de PayPal para procesar pagos:

1. **Crear transacción**: Inicia un proceso de pago en PayPal
2. **Confirmar pago**: Verifica y confirma la transacción después de que el usuario apruebe
3. **Rastrear estado**: Consulta el estado de un pago completado

## ⚡ Características

- Carrito persistente por usuario
- Integración completa con PayPal
- Gestión de estados de pedidos
- Historial de compras
- Cálculo automático de totales
- Validación de inventario

## 🧪 Ejemplos

### Añadir producto al carrito
```bash
curl -X POST http://localhost:3003/api/carrito \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productoId": "prod_123",
    "cantidad": 2,
    "precio": 49.99
  }'
```

### Crear pedido
```bash
curl -X POST http://localhost:3003/api/pedidos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "carritoId": "cart_123",
    "direccionEnvio": "Calle Principal 123, Ciudad",
    "telefonoEnvio": "+34 912345678"
  }'
```

### Iniciar transacción PayPal
```bash
curl -X POST http://localhost:3003/api/pagos/crear-transaccion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "pedidoId": "order_123",
    "monto": 99.98,
    "moneda": "EUR"
  }'
```

## 📝 Notas

- Los carritos se almacenan en Supabase
- PayPal se configura en modo sandbox para testing
- Los pagos se verifican antes de procesar el pedido
- Se mantiene un historial completo de transacciones
