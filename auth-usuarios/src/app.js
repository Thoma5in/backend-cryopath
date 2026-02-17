import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import { responseTimeMiddleware } from "./middlewares/responseTime.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(responseTimeMiddleware);

app.get("/health", (req, res) => {
  res.json({ status: "Auth & Usuarios OK" });
});

app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);

app.use('/admin', adminRoutes);

export default app;