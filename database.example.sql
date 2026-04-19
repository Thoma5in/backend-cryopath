-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.auditoria (
  id_auditoria bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  tabla_afectada text,
  operacion text,
  fecha timestamp with time zone DEFAULT now(),
  descripcion text,
  id_usuario uuid,
  CONSTRAINT auditoria_pkey PRIMARY KEY (id_auditoria),
  CONSTRAINT auditoria_usuario_fk FOREIGN KEY (id_usuario) REFERENCES public.usuario(id)
);
CREATE TABLE public.carrito (
  id_carrito bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT now(),
  id_usuario uuid NOT NULL,
  CONSTRAINT carrito_pkey PRIMARY KEY (id_carrito),
  CONSTRAINT carrito_usuario_fk FOREIGN KEY (id_usuario) REFERENCES public.usuario(id)
);
CREATE TABLE public.carrito_producto (
  id_carrito bigint NOT NULL,
  id_producto bigint NOT NULL,
  cantidad integer,
  CONSTRAINT carrito_producto_pkey PRIMARY KEY (id_carrito, id_producto),
  CONSTRAINT carrito_producto_id_carrito_fkey FOREIGN KEY (id_carrito) REFERENCES public.carrito(id_carrito),
  CONSTRAINT carrito_producto_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.categoria (
  id_categoria bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text,
  descripcion text,
  CONSTRAINT categoria_pkey PRIMARY KEY (id_categoria)
);
CREATE TABLE public.conversacion (
  id_conversacion bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_producto bigint NOT NULL,
  id_usuario_pregunta uuid NOT NULL,
  id_usuario_producto uuid NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT now(),
  estado text DEFAULT 'activa'::text,
  CONSTRAINT conversacion_pkey PRIMARY KEY (id_conversacion),
  CONSTRAINT conversacion_producto_fk FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto),
  CONSTRAINT conversacion_usuario_pregunta_fk FOREIGN KEY (id_usuario_pregunta) REFERENCES public.usuario(id),
  CONSTRAINT conversacion_usuario_producto_fk FOREIGN KEY (id_usuario_producto) REFERENCES public.usuario(id)
);
CREATE TABLE public.envio (
  id_envio bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_orden bigint,
  direccion text,
  ciudad text,
  estado_envio text,
  fecha_salida timestamp with time zone,
  fecha_entrega timestamp with time zone,
  CONSTRAINT envio_pkey PRIMARY KEY (id_envio),
  CONSTRAINT envio_id_orden_fkey FOREIGN KEY (id_orden) REFERENCES public.orden(id_orden)
);
CREATE TABLE public.envio_pedido (
  id_envio bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_pedido bigint,
  direccion text,
  ciudad text,
  estado_envio text,
  fecha_salida timestamp with time zone,
  fecha_entrega timestamp with time zone,
  CONSTRAINT envio_pedido_pkey PRIMARY KEY (id_envio),
  CONSTRAINT envio_pedido_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido)
);
CREATE TABLE public.inventario (
  id_inventario bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_producto bigint,
  cantidad_disponible integer,
  ultima_actualizacion timestamp with time zone DEFAULT now(),
  CONSTRAINT inventario_pkey PRIMARY KEY (id_inventario),
  CONSTRAINT inventario_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.mensaje (
  id_mensaje bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_conversacion bigint NOT NULL,
  id_usuario_emisor uuid NOT NULL,
  contenido text NOT NULL,
  fecha_envio timestamp with time zone DEFAULT now(),
  leido boolean DEFAULT false,
  CONSTRAINT mensaje_pkey PRIMARY KEY (id_mensaje),
  CONSTRAINT mensaje_conversacion_fk FOREIGN KEY (id_conversacion) REFERENCES public.conversacion(id_conversacion),
  CONSTRAINT mensaje_usuario_emisor_fk FOREIGN KEY (id_usuario_emisor) REFERENCES public.usuario(id)
);
CREATE TABLE public.notificacion (
  id_notificacion bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_usuario_destino uuid NOT NULL,
  tipo text NOT NULL,
  id_conversacion bigint NOT NULL,
  id_producto bigint NOT NULL,
  leido boolean DEFAULT false,
  fecha timestamp with time zone DEFAULT now(),
  CONSTRAINT notificacion_pkey PRIMARY KEY (id_notificacion),
  CONSTRAINT notificacion_usuario_destino_fk FOREIGN KEY (id_usuario_destino) REFERENCES public.usuario(id),
  CONSTRAINT notificacion_conversacion_fk FOREIGN KEY (id_conversacion) REFERENCES public.conversacion(id_conversacion),
  CONSTRAINT notificacion_producto_fk FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.orden (
  id_orden bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT now(),
  estado text,
  total numeric,
  id_usuario uuid NOT NULL,
  paypal_order_id text,
  CONSTRAINT orden_pkey PRIMARY KEY (id_orden),
  CONSTRAINT orden_usuario_fk FOREIGN KEY (id_usuario) REFERENCES public.usuario(id)
);
CREATE TABLE public.orden_detalle (
  id_orden bigint NOT NULL,
  id_producto bigint NOT NULL,
  cantidad integer,
  precio_unitario numeric,
  CONSTRAINT orden_detalle_pkey PRIMARY KEY (id_orden, id_producto),
  CONSTRAINT orden_detalle_id_orden_fkey FOREIGN KEY (id_orden) REFERENCES public.orden(id_orden),
  CONSTRAINT orden_detalle_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.pago (
  id_pago bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_orden bigint,
  fecha_pago timestamp with time zone DEFAULT now(),
  metodo text,
  monto numeric,
  estado text,
  CONSTRAINT pago_pkey PRIMARY KEY (id_pago),
  CONSTRAINT pago_id_orden_fkey FOREIGN KEY (id_orden) REFERENCES public.orden(id_orden)
);
CREATE TABLE public.pago_pedido (
  id_pago bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_pedido bigint,
  fecha_pago timestamp with time zone DEFAULT now(),
  metodo text,
  monto numeric,
  estado text,
  CONSTRAINT pago_pedido_pkey PRIMARY KEY (id_pago),
  CONSTRAINT pago_pedido_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido)
);
CREATE TABLE public.pedido (
  id_pedido bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT now(),
  estado text,
  total numeric,
  id_usuario uuid NOT NULL,
  CONSTRAINT pedido_pkey PRIMARY KEY (id_pedido),
  CONSTRAINT pedido_usuario_fk FOREIGN KEY (id_usuario) REFERENCES public.usuario(id)
);
CREATE TABLE public.pedido_detalle (
  id_pedido bigint NOT NULL,
  id_producto bigint NOT NULL,
  cantidad integer,
  precio_unitario numeric,
  CONSTRAINT pedido_detalle_pkey PRIMARY KEY (id_pedido, id_producto),
  CONSTRAINT pedido_detalle_id_pedido_fkey FOREIGN KEY (id_pedido) REFERENCES public.pedido(id_pedido),
  CONSTRAINT pedido_detalle_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.producto (
  id_producto bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text,
  descripcion text,
  precio_base numeric,
  fecha_registro timestamp with time zone DEFAULT now(),
  id_usuario uuid,
  embedding USER-DEFINED,
  estado text,
  CONSTRAINT producto_pkey PRIMARY KEY (id_producto),
  CONSTRAINT producto_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id)
);
CREATE TABLE public.producto_categoria (
  id_producto bigint NOT NULL,
  id_categoria bigint NOT NULL,
  CONSTRAINT producto_categoria_pkey PRIMARY KEY (id_producto, id_categoria),
  CONSTRAINT producto_categoria_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto),
  CONSTRAINT producto_categoria_id_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categoria(id_categoria)
);
CREATE TABLE public.producto_imagen (
  id_imagen bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_producto bigint,
  url text,
  CONSTRAINT producto_imagen_pkey PRIMARY KEY (id_imagen),
  CONSTRAINT producto_imagen_id_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.producto_resena (
  id_resena bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_producto bigint NOT NULL,
  id_usuario uuid NOT NULL,
  estrellas integer NOT NULL CHECK (estrellas >= 1 AND estrellas <= 5),
  comentario text,
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT producto_resena_pkey PRIMARY KEY (id_resena),
  CONSTRAINT producto_resena_producto_fk FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto),
  CONSTRAINT producto_resena_usuario_fk FOREIGN KEY (id_usuario) REFERENCES public.usuario(id)
);
CREATE TABLE public.promociones (
  id_promocion uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  descripcion text,
  tipo_descuento character varying NOT NULL CHECK (tipo_descuento::text = ANY (ARRAY['porcentaje'::character varying, 'monto_fijo'::character varying]::text[])),
  valor_descuento numeric NOT NULL CHECK (valor_descuento > 0::numeric),
  fecha_inicio timestamp with time zone NOT NULL,
  fecha_fin timestamp with time zone NOT NULL,
  activa boolean NOT NULL DEFAULT true,
  prioridad integer NOT NULL DEFAULT 0,
  combinable boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT promociones_pkey PRIMARY KEY (id_promocion)
);
CREATE TABLE public.promociones_categorias (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_promocion uuid NOT NULL,
  id_categoria bigint NOT NULL,
  CONSTRAINT promociones_categorias_pkey PRIMARY KEY (id),
  CONSTRAINT promociones_categorias_promocion_fkey FOREIGN KEY (id_promocion) REFERENCES public.promociones(id_promocion),
  CONSTRAINT promociones_categorias_categoria_fkey FOREIGN KEY (id_categoria) REFERENCES public.categoria(id_categoria)
);
CREATE TABLE public.promociones_productos (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_promocion uuid NOT NULL,
  id_producto bigint NOT NULL,
  CONSTRAINT promociones_productos_pkey PRIMARY KEY (id),
  CONSTRAINT promociones_productos_promocion_fkey FOREIGN KEY (id_promocion) REFERENCES public.promociones(id_promocion),
  CONSTRAINT promociones_productos_producto_fkey FOREIGN KEY (id_producto) REFERENCES public.producto(id_producto)
);
CREATE TABLE public.promociones_super_categorias (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_promocion uuid NOT NULL,
  id_super_categoria bigint NOT NULL,
  CONSTRAINT promociones_super_categorias_pkey PRIMARY KEY (id),
  CONSTRAINT promociones_super_categorias_super_categoria_fkey FOREIGN KEY (id_super_categoria) REFERENCES public.super_categoria(id_super_categoria),
  CONSTRAINT promociones_super_categorias_promocion_fkey FOREIGN KEY (id_promocion) REFERENCES public.promociones(id_promocion)
);
CREATE TABLE public.rol (
  id_rol bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text,
  CONSTRAINT rol_pkey PRIMARY KEY (id_rol)
);
CREATE TABLE public.super_categoria (
  id_super_categoria bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL UNIQUE,
  descripcion text,
  estado boolean DEFAULT true,
  fecha_creacion timestamp with time zone DEFAULT now(),
  CONSTRAINT super_categoria_pkey PRIMARY KEY (id_super_categoria)
);
CREATE TABLE public.super_categoria_categoria (
  id_super_categoria bigint NOT NULL,
  id_categoria bigint NOT NULL,
  CONSTRAINT super_categoria_categoria_pkey PRIMARY KEY (id_super_categoria, id_categoria),
  CONSTRAINT scc_super_categoria_fk FOREIGN KEY (id_super_categoria) REFERENCES public.super_categoria(id_super_categoria),
  CONSTRAINT scc_categoria_fk FOREIGN KEY (id_categoria) REFERENCES public.categoria(id_categoria)
);
CREATE TABLE public.usuario (
  id uuid NOT NULL DEFAULT auth.uid(),
  nombre text,
  apellido text,
  correo text UNIQUE,
  contraseña_hash text,
  direccion text,
  fecha_creacion timestamp with time zone DEFAULT now(),
  estado text,
  telefono text,
  CONSTRAINT usuario_pkey PRIMARY KEY (id)
);
CREATE TABLE public.usuario_direccion (
  id_direccion bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  id_usuario uuid NOT NULL,
  nombre_direccion text,
  direccion text NOT NULL,
  ciudad text,
  referencia text,
  es_principal boolean DEFAULT false,
  fecha_creacion timestamp without time zone DEFAULT now(),
  CONSTRAINT usuario_direccion_pkey PRIMARY KEY (id_direccion),
  CONSTRAINT direccion_usuario_fk FOREIGN KEY (id_usuario) REFERENCES public.usuario(id)
);
CREATE TABLE public.usuario_rol (
  id_rol bigint NOT NULL,
  id_usuario uuid NOT NULL,
  CONSTRAINT usuario_rol_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.rol(id_rol),
  CONSTRAINT usuario_rol_usuario_fk FOREIGN KEY (id_usuario) REFERENCES public.usuario(id)
);