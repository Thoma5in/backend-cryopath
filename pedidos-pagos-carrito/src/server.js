import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Pedidos, Pagos & Carrito service running on port ${PORT}`);
});