import express from "express";
import cors from "cors";
import { supabase } from "./config/supabase.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    // Verificar conexión a Supabase
    const { error } = await supabase.from('productos').select('count', { count: 'exact', head: true });
    
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

export default app;