import {Router} from "express";
import { crearOrden } from "../controllers/orden.controller.js";

const router = Router();

router.post("/", crearOrden)

export default router;