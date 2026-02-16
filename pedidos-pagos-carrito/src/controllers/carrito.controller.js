// src/controllers/carrito.controller.js
import {supabase} from "../config/supabase.js";

export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const {data, error} = await supabase
    .from("carrito")
    .select(`
        id_carrito,
        carrito_producto (
          id_producto,
          cantidad,
          producto (
            id_producto,
            nombre,
            precio_base,
            producto_imagen ( url ),
            inventario ( cantidad_disponible ),
            producto_categoria (
              id_categoria,
              categoria:categoria ( nombre )
            )
          )
        )
      `)
      .eq("id_usuario", userId)
      .single();

      if (error || !data) {
        return res.json({ success: true, data: []})
      }

      //Normalizar salida para el frontend
      const items = data.carrito_producto.map(item => {
        const imagenes = item.producto.producto_imagen?.map(imagen => imagen.url) ?? [];
        const pc = item.producto.producto_categoria?.[0] ?? null;
        return {
          id: item.producto.id_producto,
          id_producto: item.producto.id_producto,
          nombre: item.producto.nombre,
          precio: item.producto.precio_base,
          cantidad: item.cantidad,
          stock: item.producto.inventario?.[0]?.cantidad_disponible ?? 0,
          imagen: imagenes[0] ?? null,
          imagenes,
          id_categoria: pc?.id_categoria ?? null,
          categoria_nombre: pc?.categoria?.nombre ?? null,
        };
      })

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

    const {data: inventario, error: inventarioError} = await supabase
    .from("inventario")
    .select("cantidad_disponible")
    .eq("id_producto", id_producto)
    .single();

    if (inventarioError || !inventario) {
      return res.status(404).json({
        success: false,
        message: "Inventario no encontrado para el producto",
      })
    }
    //4 Si existe, actualizar cantidad
    if (existente) {
        const nuevaCantidad = existente.cantidad + cantidad;

        if (nuevaCantidad > inventario.cantidad_disponible) {
          return res.status(400).json({
            success: false,
            message: "Cantidad solicitada excede el inventario disponible",
          })
        }

        await supabase
        .from("carrito_producto")
        .update({cantidad: nuevaCantidad})
        .eq("id_carrito", carrito.id_carrito)
        .eq("id_producto", id_producto);

    } else {
        //5 Si no existe, agregar nuevo item
        if (cantidad > inventario.cantidad_disponible) {
          return res.status(400).json({
            success: false,
            message: "Cantidad solicitada excede el inventario disponible",
          })
        }

        await supabase
        .from("carrito_producto")
        .insert({
          id_carrito: carrito.id_carrito,
          id_producto,
          cantidad
        })
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
  try {
    const { itemId, userId } = req.params;
    const { cantidad } = req.body;

    // Validar entrada
    if (!itemId || !userId) {
      return res.status(400).json({
        success: false,
        message: "itemId y userId son requeridos"
      });
    }

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({
        success: false,
        message: "La cantidad debe ser mayor a 0"
      });
    }

    // Consultar inventario
    const {data: inventario, error: inventarioError} = await supabase
    .from("inventario")
    .select("cantidad_disponible")
    .eq("id_producto", itemId)
    .single();

    if (inventarioError || !inventario) {
      return res.status(404).json({
        success: false,
        message: "Inventario no encontrado para el producto",
      })
    }

    if (cantidad > inventario.cantidad_disponible) {
      return res.status(400).json({
        success: false,
        message: "Cantidad solicitada excede el inventario disponible",
      })
    }

    // Obtener el carrito del usuario
    const { data: carrito, error: carritoError } = await supabase
      .from("carrito")
      .select("id_carrito")
      .eq("id_usuario", userId)
      .single();

    if (carritoError || !carrito) {
      return res.status(404).json({
        success: false,
        message: "Carrito no encontrado"
      });
    }

    // Actualizar la cantidad
    const { error } = await supabase
      .from("carrito_producto")
      .update({ cantidad })
      .eq("id_carrito", carrito.id_carrito)
      .eq("id_producto", itemId);

    if (error) {
      throw error;
    }

    res.json({ success: true, message: "Cantidad actualizada" });
  } catch (error) {
    console.error("Error al actualizar cantidad:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar la cantidad del producto"
    });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { itemId, userId } = req.params;

    // Obtener el carrito del usuario
    const { data: carrito, error: carritoError } = await supabase
    .from("carrito")
    .select("id_carrito")
    .eq("id_usuario", userId)
    .single();

    if (carritoError || !carrito) {
      return res.status(404).json({ success: false, message: "Carrito no encontrado" });
    }

    // Eliminar el item del carrito
    const { error } = await supabase
    .from("carrito_producto")
    .delete()
    .eq("id_carrito", carrito.id_carrito)
    .eq("id_producto", itemId);

    if (error) {
      throw error;
    }

  res.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar el item del carrito:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar el item del carrito",
    });
  }
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

export const getCartByCategory = async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("carrito")
      .select(`
        id_carrito,
        carrito_producto (
          id_producto,
          cantidad,
          producto (
            id_producto,
            nombre,
            precio_base,
            producto_imagen ( url ),
            inventario ( cantidad_disponible ),
            producto_categoria (
              id_categoria,
              categoria:categoria ( nombre )
            )
          )
        )
      `)
      .eq("id_usuario", userId)
      .single();

    if (error || !data) {
      return res.json({ success: true, data: [] });
    }

    const grouped = {};

    for (const cp of data.carrito_producto) {
      const producto = cp.producto;
      const imagenes = producto.producto_imagen?.map(i => i.url) ?? [];
      const pc = producto.producto_categoria?.[0] ?? null;
      const catId = pc?.id_categoria ?? "sin-categoria";
      const catName = pc?.categoria?.nombre ?? "Sin categoría";

      if (!grouped[catId]) {
        grouped[catId] = { id_categoria: pc?.id_categoria ?? null, categoria_nombre: catName, items: [] };
      }

      grouped[catId].items.push({
        id: producto.id_producto,
        id_producto: producto.id_producto,
        nombre: producto.nombre,
        precio: producto.precio_base,
        cantidad: cp.cantidad,
        stock: producto.inventario?.[0]?.cantidad_disponible ?? 0,
        imagen: imagenes[0] ?? null,
        imagenes,
      });
    }

    const categorias = Object.values(grouped);

    res.json({ success: true, data: categorias });
  } catch (error) {
    console.error("Error al obtener carrito por categoría:", error);
    res.status(500).json({ success: false, message: "Error al obtener carrito por categoría" });
  }
};
