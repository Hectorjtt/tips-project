// src/controllers/tipController.ts
import { Request, Response } from "express";
import { createTipService } from "../services/tipService";

export const createTip = (req: Request, res: Response) => {
  try {
    const { total, method, divisionType, employees } = req.body;
    
    // Llamamos a la capa de servicio para la lógica de negocio
    const receipt = createTipService({ total, method, divisionType, employees });
    
    // Respuesta con el recibo
    return res.status(201).json(receipt);
  } catch (error: any) {
    // Si hay un error, lo retornamos con estado 400 (Bad Request)
    return res.status(400).json({ error: error.message });
  }
};