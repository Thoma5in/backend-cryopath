import app from "./app.js";

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`Pedidos, Pagos & Carrito service running on port ${PORT}`);
});