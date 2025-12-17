import express from "express";
import cors from "cors";
import supabase from "./config/supabase.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Auth & Usuarios OK" });
});

app.get("/usuarios", async (req, res) => {
  const { data, error } = await supabase
  .from("usuario")
  .select("*")
  .limit(1);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
})

export default app;