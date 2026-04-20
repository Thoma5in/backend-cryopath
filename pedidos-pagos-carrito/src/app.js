import express from "express";
import cors from "cors";
import { supabase } from "./config/supabase.js";
import carritoRoutes from "./routes/carrito.routes.js";
import pagosRoutes from "./routes/pagos.routes.js";
import ordenRoutes from "./routes/orden.routes.js";
import pedidosRoutes from "./routes/pedidos.routes.js";
import enviaRoutes from "./routes/envia.routes.js";
import { responseTimeMiddleware } from "./middlewares/responseTime.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(responseTimeMiddleware);

app.get("/health", (req, res) => {
  res.json({ status: "Pedidos, Pagos & Carrito OK" });
});

app.use("/cart", carritoRoutes);
app.use("/orden", ordenRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/pagos", pagosRoutes);
app.use("/envia", enviaRoutes);

export default app;