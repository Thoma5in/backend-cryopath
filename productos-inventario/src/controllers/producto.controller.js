import { supabase } from "../config/supabase.js";
import { getCached, setCached, invalidateCache, invalidatePattern } from "../services/cache.service.js";


const extraerRutaObjeto = (url) => {
	try {
		const { pathname } = new URL(url);

		// Extraer ruta interna justo después del bucket `productos`
		const marker = "/productos/";
		const idx = pathname.indexOf(marker);
		if (idx === -1) return null;

		const internal = pathname.slice(idx + marker.length);
		// `pathname` viene con % encoding; storage.remove() espera la key sin encode
		try {
			return decodeURIComponent(internal);
		} catch {
			return internal;
		}
	} catch {
		return null;
	}
};



export const crearProducto = async (req, res) => {
	const {
		nombre,
		descripcion,
		precio_base,
		cantidad_disponible,
		id_usuario,
		estado = "activo",
		embedding,
		id_categoria,
	} = req.body;

	if (!nombre || precio_base === undefined || precio_base === null) {
		return res
			.status(400)
			.json({ message: "Nombre y precio_base son obligatorios" });
	}

	if (!id_categoria) {
		return res
			.status(400)
			.json({ message: "id_categoria es obligatorio" });
	}

	const stockInicial = Number(cantidad_disponible);

	if (!Number.isInteger(stockInicial) || stockInicial < 0) {
		return res.status(400).json({
			message: "cantidad_disponible debe ser un entero >= 0",
		});
	}

	try {
		const { data: producto, error } = await supabase
			.from("producto")
			.insert([
				{
					nombre,
					descripcion,
					precio_base,
					estado,
					id_usuario,
					embedding,
				},
			])
			.select()
			.single();

		const { error: inventarioError } = await supabase
			.from("inventario")
			.insert({
				id_producto: producto.id_producto,
				cantidad_disponible: stockInicial,
				ultima_actualizacion: new Date().toISOString(),
			});



		if (inventarioError) {
			console.error("Error creando inventario:", inventarioError);
			return res.status(500).json({
				message: "Producto creado pero error al crear inventario",
			});
		}

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		// Guardar relación con categoría
		const { error: categoriaError } = await supabase
			.from("producto_categoria")
			.insert({
				id_producto: producto.id_producto,
				id_categoria,
			});

		if (categoriaError) {
			console.error("Error asignando categoría:", categoriaError);
			return res.status(500).json({
				message: "Producto creado pero error al asignar categoría",
			});
		}

		console.log("BODY PRODUCTO:", req.body);

		// Invalidar caché de productos y relaciones producto-categoria
		const keysInvalidated = await invalidatePattern("productos:*");
		console.log(`🗑️ Cache invalidado - ${keysInvalidated} claves eliminadas`);

		await invalidateCache(`producto:categoria:${producto.id_producto}`);
		await invalidateCache(`categoria:productos:${id_categoria}`);

		return res.status(201).json({
			message: "Producto creado exitosamente",
			producto,
			inventario: {
				cantidad_disponible: stockInicial,
			},
			id_categoria,
		});

	} catch (error) {
		console.error("Error al crear producto:", error);
		return res.status(500).json({
			error: "Error interno del servidor",
		});
	}
};


export const obtenerProductos = async (req, res) => {
	try {
		const limit = Math.min(Number(req.query.limit) || 20, 100); // Max 100
		const offset = Math.max(Number(req.query.offset) || 0, 0);
		const cacheKey = `productos:all:${limit}:${offset}`;

		console.log(`📦 GET /productos - limit: ${limit}, offset: ${offset}`);

		// Intentar obtener del caché
		const cached = await getCached(cacheKey);
		if (cached) {
			console.log(`✅ CACHE HIT - Devolviendo ${cached.productos.length} productos desde Redis`);
			return res.status(200).json({
				...cached,
				_cache: "HIT" // Indicador de que vino del caché
			});
		}

		console.log(`❌ CACHE MISS - Obteniendo de Supabase...`);

		// Obtener total de productos
		const { count, error: countError } = await supabase
			.from("producto")
			.select("*", { count: "exact", head: true });

		if (countError) {
			return res.status(400).json({ error: countError.message });
		}

		// Obtener productos con paginación
		const { data, error } = await supabase
			.from("producto")
			.select("*")
			.range(offset, offset + limit - 1);

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		const response = {
			productos: data,
			paginacion: {
				total: count,
				limit,
				offset,
				paginas: Math.ceil(count / limit),
			},
		};

		// Cachear resultado
		await setCached(cacheKey, response, "productos");
		console.log(`💾 CACHE STORED - ${cacheKey} almacenado en Redis (TTL: 30min)`);

		return res.status(200).json({
			...response,
			_cache: "MISS" // Indicador de que vino de BD
		});
	} catch (error) {
		console.error("Error al obtener productos:", error);
		return res.status(500).json({
			error: "Error interno del servidor",
		});
	}
};


export const editarProducto = async (req, res) => {
	const { id_producto } = req.params;
	const {
		nombre,
		descripcion,
		precio_base,
		estado,
		id_usuario,
		embedding,
		id_categoria,
	} = req.body;

	if (!id_producto) {
		return res.status(400).json({ message: "El id_producto del producto es obligatorio" });
	}

	const camposActualizables = {};
	if (nombre !== undefined) camposActualizables.nombre = nombre;
	if (descripcion !== undefined) camposActualizables.descripcion = descripcion;
	if (precio_base !== undefined) camposActualizables.precio_base = precio_base;
	if (estado !== undefined) camposActualizables.estado = estado;
	if (id_usuario !== undefined) camposActualizables.id_usuario = id_usuario;
	if (embedding !== undefined) camposActualizables.embedding = embedding;

	if (Object.keys(camposActualizables).length === 0) {
		return res.status(400).json({
			message: "No se proporcionaron campos para actualizar",
		});
	}

	try {
		const { data, error } = await supabase
			.from("producto")
			.update(camposActualizables)
			.eq("id_producto", id_producto)
			.select()
			.single();

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		if (!data) {
			return res.status(404).json({ message: "Producto no encontrado" });
		}

		// Si se proporciona una nueva categoría, actualizar la relación
		if (id_categoria !== undefined) {
			const { data: categoriaActual } = await supabase
				.from("producto_categoria")
				.select("id_categoria")
				.eq("id_producto", id_producto)
				.maybeSingle();

			// Eliminar la categoría anterior
			const { error: deleteError } = await supabase
				.from("producto_categoria")
				.delete()
				.eq("id_producto", id_producto);

			if (deleteError) {
				console.error("Error eliminando categoría anterior:", deleteError);
				return res.status(500).json({
					message: "Producto actualizado pero error al cambiar categoría",
				});
			}

			// Insertar la nueva categoría
			const { error: insertError } = await supabase
				.from("producto_categoria")
				.insert({
					id_producto,
					id_categoria,
				});

			if (insertError) {
				console.error("Error asignando nueva categoría:", insertError);
				return res.status(500).json({
					message: "Producto actualizado pero error al asignar nueva categoría",
				});
			}

			await invalidateCache(`producto:categoria:${id_producto}`);

			if (categoriaActual?.id_categoria) {
				await invalidateCache(`categoria:productos:${categoriaActual.id_categoria}`);
			}

			await invalidateCache(`categoria:productos:${id_categoria}`);
		}

		// Invalidar caché de productos
		const keysInvalidated = await invalidatePattern("productos:*");
		console.log(`🗑️ Cache invalidado - ${keysInvalidated} claves eliminadas`);

		return res.status(200).json({
			message: "Producto actualizado exitosamente",
			producto: data,
		});
	} catch (error) {
		console.error("Error al editar producto:", error);
		return res.status(500).json({
			error: "Error interno del servidor",
		});
	}
};


export const eliminarProducto = async (req, res) => {
	const { id_producto } = req.params;

	if (!id_producto) {
		return res
			.status(400)
			.json({ message: "El id_producto del producto es obligatorio" });
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
			imagenes
				?.map(({ url }) => extraerRutaObjeto(url))
				.filter(Boolean) ?? [];
				
		console.log("Rutas a eliminar del bucket:", rutasAlmacenadas);

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

		// Eliminar relación con categorías
		const { data: categoriaActual } = await supabase
			.from("producto_categoria")
			.select("id_categoria")
			.eq("id_producto", id_producto)
			.maybeSingle();

		const { error: categoriaError } = await supabase
			.from("producto_categoria")
			.delete()
			.eq("id_producto", id_producto);
		if (categoriaError) {
			return res.status(400).json({ error: categoriaError.message });
		}

		const { data, error } = await supabase
			.from("producto")
			.delete()
			.eq("id_producto", id_producto)
			.select()
			.single();

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		if (!data) {
			return res.status(404).json({ message: "Producto no encontrado" });
		}

		// Invalidar caché de productos y relaciones producto-categoria
		const keysInvalidated = await invalidatePattern("productos:*");
		console.log(`🗑️ Cache invalidado - ${keysInvalidated} claves eliminadas`);

		await invalidateCache(`producto:categoria:${id_producto}`);
		if (categoriaActual?.id_categoria) {
			await invalidateCache(`categoria:productos:${categoriaActual.id_categoria}`);
		}

		return res.status(200).json({
			message: "Producto eliminado exitosamente",
			producto: data
		});

	} catch (error) {
		console.error("Error al eliminar producto:", error);
		return res.status(500).json({
			error: "Error interno del servidor",
		});
	}
};


export const obtenerImagenProducto = async (req, res) => {
	const { id_producto } = req.params;
	if (!id_producto) {
		return res.status(400).json({ message: "El id_producto es obligatorio" });
	}
	try {
		const { data, error } = await supabase
			.from("producto_imagen")
			.select("url")
			.eq("id_producto", id_producto)
			.order("id_imagen", { ascending: false })
			.limit(1)
			.single();
		if (error) {
			return res.status(400).json({ error: error.message });
		}
		if (!data) {
			return res.status(404).json({ message: "Imagen no encontrada" });
		}
		return res.status(200).json({ url: data.url });
	} catch (err) {
		console.error("Error al obtener imagen de producto:", err);
		return res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const obtenerImagenesProducto = async (req, res) => {
	const { id_producto } = req.params;
	if (!id_producto) {
		return res.status(400).json({ message: "El id_producto es obligatorio" });
	}
	try {
		const { data, error } = await supabase
			.from("producto_imagen")
			.select("id_imagen, url")
			.eq("id_producto", id_producto)
			.order("id_imagen", { ascending: false });

		if (error) {
			return res.status(400).json({ error: error.message });
		}

		return res.status(200).json({ imagenes: data ?? [] });
	} catch (err) {
		console.error("Error al obtener imágenes de producto:", err);
		return res.status(500).json({ error: "Error interno del servidor" });
	}
};

export const buscarProductos = async (req, res) => {
	try {
		const { q } = req.query;

		if (!q || q.trim().length < 2) {
			return res.json([]);
		}

		const { data, error } = await supabase
			.from("producto")
			.select(`
        id_producto,
        nombre,
        precio_base,
        producto_imagen (
          url
        )
      `)
			.eq("estado", "activo")
			.ilike("nombre", `%${q}%`)
			.limit(10);

		if (error) throw error;

		const productos = data.map(producto => ({
			id_producto: producto.id_producto,
			nombre: producto.nombre,
			precio_base: producto.precio_base,
			imagen: producto.producto_imagen?.[0]?.url || "/img/no-image.png"
		}));

		return res.json(productos);

	} catch (error) {
		console.error("Error en búsqueda:", error);
		return res.status(500).json({
			message: "Error al buscar productos"
		});
	}

	
};


export const obtenerProductosRelacionados = async (req, res) => {
	const { id_producto } = req.params;

	console.log("🔍 [RELACIONADOS] Buscando productos relacionados para id_producto:", id_producto);

	if (!id_producto) {
		return res.status(400).json({
			message: "El id_producto es obligatorio"
		});
	}
	const limit = Number(req.query.limit) || 10;

	try {
		// Paso 1: Obtener categoría del producto con su nombre
		const { data: categoriaData, error: categoriaError } = await supabase
			.from("producto_categoria")
			.select(`
				id_categoria,
				categoria (
					id_categoria,
					nombre
				)
			`)
			.eq("id_producto", id_producto)
			.single();

		console.log("📦 [RELACIONADOS] Paso 1 - Categoría encontrada:", categoriaData);
		console.log("❌ [RELACIONADOS] Paso 1 - Error categoría:", categoriaError);

		if (categoriaError || !categoriaData) {
			console.log("⚠️ [RELACIONADOS] El producto no tiene categoría asignada");
			return res.status(200).json({
				id_producto,
				categoria: null,
				total: 0,
				productos: [],
				debug: { mensaje: "Producto sin categoría asignada" }
			});
		}

		const categoriaInfo = {
			id_categoria: categoriaData.id_categoria,
			nombre: categoriaData.categoria?.nombre || null
		};

		console.log("📦 [RELACIONADOS] Categoría info:", categoriaInfo);

		// Paso 2: Obtener IDs de productos de la misma categoría
		const { data: productosCategoria, error: prodCatError } = await supabase
			.from("producto_categoria")
			.select("id_producto")
			.eq("id_categoria", categoriaData.id_categoria)
			.neq("id_producto", id_producto);

		console.log("📦 [RELACIONADOS] Paso 2 - Productos en misma categoría:", productosCategoria);
		console.log("❌ [RELACIONADOS] Paso 2 - Error:", prodCatError);

		if (prodCatError) throw prodCatError;

		if (!productosCategoria || productosCategoria.length === 0) {
			console.log("⚠️ [RELACIONADOS] No hay otros productos en la categoría", categoriaData.id_categoria);
			return res.status(200).json({
				id_producto,
				categoria: categoriaInfo,
				total: 0,
				productos: [],
				debug: { 
					mensaje: "No hay otros productos en esta categoría",
					id_categoria: categoriaData.id_categoria
				}
			});
		}

		// Paso 3: Extraer los IDs
		const idsRelacionados = productosCategoria.map(p => p.id_producto);
		console.log("📦 [RELACIONADOS] Paso 3 - IDs relacionados:", idsRelacionados);

		// Paso 4: Obtener los productos con sus imágenes
		const { data: productos, error: productosError } = await supabase
			.from("producto")
			.select(`
				id_producto,
				nombre,
				precio_base,
				estado,
				producto_imagen (
					url
				)
			`)
			.in("id_producto", idsRelacionados)
			.eq("estado", "activo")
			.limit(limit);

		console.log("📦 [RELACIONADOS] Paso 4 - Productos obtenidos:", productos);
		console.log("❌ [RELACIONADOS] Paso 4 - Error:", productosError);

		if (productosError) throw productosError;

		// Normalizar respuesta
		const productosRelacionados = (productos || []).map(p => ({
			id_producto: p.id_producto,
			nombre: p.nombre,
			precio_base: p.precio_base,
			imagen: p.producto_imagen?.[0]?.url || "/img/no-image.png"
		}));

		console.log("✅ [RELACIONADOS] Resultado final:", productosRelacionados.length, "productos");

		return res.status(200).json({
			id_producto,
			categoria: categoriaInfo,
			total: productosRelacionados.length,
			productos: productosRelacionados
		});

	} catch (error) {
		console.error("💥 [RELACIONADOS] Error:", error);
		return res.status(500).json({
			message: "Error al obtener productos relacionados",
			debug: { error: error.message }
		});
	}
};
