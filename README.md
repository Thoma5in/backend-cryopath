# backend-cryopath

Sigue los pasos para configurar el backend

## 1) Primer Microservicio (auth-usuarios)

```bash
pnpm init
pnpm add express dotenv cors jsonwebtoken
pnpm add -D nodemon
```

## 2) Segundo Microservicio (pedidos-pagos-carrito)

```bash
pnpm init
pnpm add express dotenv cors 
pnpm add -D nodemon
```

## 3) Tercer Microservicio (productos-inventario)

```bash
pnpm init
pnpm add express dotenv cors jsonwebtoken
pnpm add -D nodemon
```

## 4) Crea los .env en cada carpeta de microservicios y añade esto

```bash
PORT="puerto de tu microservicio"
SUPABASE_URL=
SUPABASE_KEY=
JWT_SECRET=
```
## 5) Acomoda el json de cada microservicio así

```bash
{
  "name": "auth-usuarios",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js"
  }

```

## 6) Prueba cada puerto de cada microservicio

```bash
pnpm dev
http://localhost:3001/health
```
