import express from "express";
import cors from "cors";
import { supabase } from "./config/supabase.js";
import carritoRoutes from "./routes/carrito.routes.js";
import pagosRoutes from "./routes/pagos.routes.js";
import ordenRoutes from "./routes/orden.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Pedidos, Pagos & Carrito OK" });
});

app.use("/cart", carritoRoutes);
app.use("/orden", ordenRoutes);

app.get("/test-db", async (req, res) => {
  const { data, error } = await supabase
  .from("producto")
  .select(`*, producto_imagen (id_imagen, url)`);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json({ data });
})

app.use("/pagos", pagosRoutes);
app.use("/orden", ordenRoutes);

export default app;