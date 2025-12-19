import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Auth & Usuarios OK" });
});


app.use('/auth', authRoutes);

export default app;