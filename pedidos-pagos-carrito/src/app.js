import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Pedidos, Pagos & Carrito OK" });
});

app.get("/test-db", async (req, res) => {
  const { data, error } = await supabase
  .from("/orden")
  .select("*")
  .limit(1);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
})

export default app;