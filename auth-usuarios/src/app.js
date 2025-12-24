import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Auth & Usuarios OK" });
});

app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);

export default app;