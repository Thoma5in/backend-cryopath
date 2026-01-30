import express from 'express';
import {
    crearSupercategoria,
    listarSupercategorias,
    obtenerSupercategoria,
    actualizarSupercategoria,
    eliminarSupercategoria,
    obtenerCategoriasDeSupercategoria,
    asignarCategoriaASupercategoria,
    desasignarCategoriaDeSupercategoria,
    obtenerProductosPorSupercategoria
} from '../controllers/supercategorias.controller.js';

import { requireWorkerOrAdmin } from "../../../auth-usuarios/src/middlewares/worker.middleware.js";

const router = express.Router();

// Rutas básicas de CRUD para supercategorías
router.get('/', listarSupercategorias);
router.get('/:id_super_categoria', obtenerSupercategoria);
router.post('/', requireWorkerOrAdmin, crearSupercategoria);
router.put('/:id_super_categoria', requireWorkerOrAdmin, actualizarSupercategoria);
router.delete('/:id_super_categoria', requireWorkerOrAdmin, eliminarSupercategoria);

// Rutas para gestión de categorías dentro de supercategorías
router.get('/:id_super_categoria/categorias', obtenerCategoriasDeSupercategoria);
router.post('/:id_super_categoria/categorias/:id_categoria', requireWorkerOrAdmin, asignarCategoriaASupercategoria);
router.delete('/:id_super_categoria/categorias/:id_categoria', requireWorkerOrAdmin, desasignarCategoriaDeSupercategoria);

// Ruta para filtrar productos por supercategoría
router.get('/:id_super_categoria/productos', obtenerProductosPorSupercategoria);

export default router;
