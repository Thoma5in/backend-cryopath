import express from 'express';
import {crearCategorias,
        listarCategorias,
        obtenerCategoria,
        actualizarCategoria,
        eliminarCategoria} from '../controllers/categorias.controller.js';

import { requireWorkerOrAdmin } from "../../../auth-usuarios/src/middlewares/worker.middleware.js";

const router = express.Router();

router.get('/', listarCategorias);
router.get('/:id', obtenerCategoria);
router.post('/', requireWorkerOrAdmin, crearCategorias);
router.put('/:id', requireWorkerOrAdmin, actualizarCategoria);
router.delete('/:id', requireWorkerOrAdmin, eliminarCategoria);

export default router;