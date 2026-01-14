import express from "express";
import cors from "cors";
import { supabase } from "./config/supabase.js";
import productosRoutes from "./routes/productos.routes.js";
import storageProductosRoutes from "./routes/storageProductos.routes.js";
import inventarioRoutes from "./routes/inventario.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    // Verificar conexión a Supabase
    const { error } = await supabase.from('producto').select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') { // PGRST116 es "tabla no encontrada", lo cual está bien por ahora
      throw error;
    }
    
    res.json({ 
      status: "Productos & Inventario OK",
      supabase: "Conectado"
    });
  } catch (error) {
    res.status(500).json({ 
      status: "Error",
      supabase: "Desconectado",
      error: error.message
    });
  }
});

// Rutas de productos
app.use("/productos", productosRoutes);
// Rutas de storage del bucket "productos" (p.ej. POST /productos/:id_producto/imagen)
app.use("/productos", storageProductosRoutes);
// Rutas de inventario
app.use("/inventario", inventarioRoutes);
// Ruta de categorias
app.use("/categorias", categoriasRoutes);


export default app;