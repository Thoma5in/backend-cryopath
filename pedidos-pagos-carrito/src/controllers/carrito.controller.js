// src/controllers/carrito.controller.js
import supabase from "../config/supabase.js";

export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const {data, error} = await supabase
    .from("carrito")
    .select(`
        id_carrito,
        carrito_producto (
          id_carrito_producto,
          cantidad,
          producto (
            id_producto,
            nombre,
            precio_base,
            producto_imagen ( url )
          )
        )
      `)
      .eq("id_usuario", userId)
      .single();

      if (error || !data) {
        return res.json({ success: true, data: []})
      }

      //Normalizar salida para el frontend
      const items = data.carrito_producto.map(item => ({
        id: item.producto.id_producto,
        id_producto: item.producto.id_producto,
        nombre: item.producto.nombre,
        precio: item.producto.precio_base,
        cantidad: item.cantidad,
        imagen: item.producto.producto_imagen[0].url
      }))

      res.json({ success: true, data: items })
    } catch (error) {
        res.status(500).json({
          success: false,
          message: "Error al obtener el carrito",
        });
    }
  }


export const addToCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const {id_producto, cantidad} = req.body;

    // 1. Buscar carrito del usuario
    let {data: carrito} = await supabase
    .from("carrito")
    .select("*")
    .eq("id_usuario", userId)
    .maybeSingle();

    //2 Crear carrito si no existe
    if (!carrito) {
        const {data: nuevoCarrito} = await supabase
        .from("carrito")
        .insert({id_usuario: userId})
        .select()
        .single();
        

        if (error) throw error;
        carrito = nuevoCarrito;
    }

    //3 Verificar si el producto ya está en el carrito
    const {data: existente, error: existeError} = await supabase
    .from("carrito_producto")
    .select("*")
    .eq("id_carrito", carrito.id_carrito)
    .eq("id_producto", id_producto)
    .maybeSingle();

    if (existeError) throw existeError

    //4 Si existe, actualizar cantidad
    if (existente) {
        await supabase
        .from("carrito_producto")
        .update({cantidad: existente.cantidad + cantidad})
        .eq("id_carrito", carrito.id_carrito)
        .eq("id_producto", id_producto)
    } else {
        //5 Si no existe, agregar nuevo item
        await supabase
        .from("carrito_producto")
        .insert({
            id_carrito: carrito.id_carrito,
            id_producto,
            cantidad
        });
    }

    res.status(200).json({
        success: true,
        message: "Producto agregado al carrito",
    });
    } catch (error) {
        console.error("Error al agregar al carrito:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar al carrito",
    })
}
};

export const updateQuantity = async (req, res) => {
  const { itemId } = req.params;
  const { cantidad } = req.body;

  await supabase
    .from("carrito_producto")
    .update({ cantidad })
    .eq("id_carrito_producto", itemId);

  res.json({ success: true });
};

export const deleteItem = async (req, res) => {
    const { itemId } = req.params;

  await supabase
    .from("carrito_producto")
    .delete()
    .eq("id_carrito_producto", itemId);

  res.json({ success: true });
};

export const clearCart = async (req, res) => {
  const { userId } = req.params;

  const { data: carrito } = await supabase
    .from("carrito")
    .select("id_carrito")
    .eq("id_usuario", userId)
    .single();

  if (carrito) {
    await supabase
      .from("carrito_producto")
      .delete()
      .eq("id_carrito", carrito.id_carrito);
  }

  res.json({ success: true });
};
