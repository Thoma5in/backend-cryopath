import express from "express";
import { rates, create, track, label } from "../controllers/envia.controller.js";

const router = express.Router();

router.post("/rates", rates);
router.post("/shipments", create);
router.get("/shipments/:id", track);
router.get("/shipments/:id/label", label);

export default router;
