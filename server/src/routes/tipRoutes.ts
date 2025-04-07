// src/routes/tipRoutes.ts
import { Router } from "express";
import { createTip, getTips } from "../controllers/tipController";

const router = Router();

// POST /api/tips
router.post("/", createTip);

// GET /api/tips para obtener todos los recibos
router.get("/", getTips);

export default router;