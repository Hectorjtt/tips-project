// src/routes/tipRoutes.ts
import { Router } from "express";
import { createTip } from "../controllers/tipController";

const router = Router();

// POST /api/tips
router.post("/", createTip);

export default router;