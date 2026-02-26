import { supabase } from "../config/supabase.js";
import { invalidateProductoImagenesCache } from "../services/cache.service.js";

const extraerRutaObjeto = (url) => {
  try {
    const { pathname } = new URL(url);
    const marker = "/productos/";
    const idx = pathname.indexOf(marker);
    if (idx === -1) return null;

    const internal = pathname.slice(idx + marker.length);
    try {
      return decodeURIComponent(internal);
    } catch {
      return internal;
    }
  } catch {
    return null;
  }
};

export const uploadImagenProducto = async (req, res) => {
  const { id_producto } = req.params;
  const file = req.file;

  if (!id_producto || !file) {
    return res
      .status(400)
      .json({ message: "id_producto y archivo son obligatorios" });
  }

  try {
    const filePath = `productos/${id_producto}/${Date.now()}-${file.originalname}`;

    const { data, error } = await supabase.storage
      .from("productos")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("productos").getPublicUrl(filePath);

    // Guardar registro en tabla producto_imagen
    const { data: imagenData, error: imagenError } = await supabase
      .from("producto_imagen")
      .insert([
        {
          id_producto: Number(id_producto),
          url: publicUrl,
        },
      ])
      .select()
      .single();

    if (imagenError) {
      return res.status(400).json({ error: imagenError.message });
    }

    // Invalidar caché de imágenes del producto
    await invalidateProductoImagenesCache(id_producto);

    return res.status(200).json({
      message: "Imagen subida correctamente",
      path: data.path,
      url: publicUrl,
      imagen: imagenData,
    });
  } catch (error) {
    console.error("Error al subir imagen al bucket productos:", error);
    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
};

export const eliminarImagenesProducto = async (req, res) => {
  const { id_producto } = req.params;

  if (!id_producto) {
    return res.status(400).json({ message: "El id_producto es obligatorio" });
  }

  try {
    const { data: imagenes, error: obtenerImagenesError } = await supabase
      .from("producto_imagen")
      .select("url")
      .eq("id_producto", id_producto);

    if (obtenerImagenesError) {
      return res.status(400).json({ error: obtenerImagenesError.message });
    }

    const rutasAlmacenadas =
      imagenes?.map(({ url }) => extraerRutaObjeto(url)).filter(Boolean) ?? [];

    if (rutasAlmacenadas.length) {
      const { error: storageError } = await supabase.storage
        .from("productos")
        .remove(rutasAlmacenadas);
      if (storageError) {
        return res.status(400).json({ error: storageError.message });
      }
    }

    const { error: imagenError } = await supabase
      .from("producto_imagen")
      .delete()
      .eq("id_producto", id_producto);

    if (imagenError) {
      return res.status(400).json({ error: imagenError.message });
    }

    // Invalidar caché de imágenes del producto
    await invalidateProductoImagenesCache(id_producto);

    return res.status(200).json({
      message: "Imágenes eliminadas correctamente",
      eliminadas: rutasAlmacenadas.length,
    });
  } catch (error) {
    console.error("Error al eliminar imágenes del producto:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
