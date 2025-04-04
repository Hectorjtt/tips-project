// src/controllers/tipController.ts
import { Request, Response } from "express";
import { createTipService } from "../services/tipService";

export const createTip = (req: Request, res: Response) => {
  try {
    // Extraemos total, method, divisionType, numberOfEmployees, employeePercentages, employees
    // y, en caso de pago con tarjeta, datos adicionales: cardNumber, cardExpiry, cardCvc.
    const {
      total,
      method,
      divisionType,
      numberOfEmployees,
      employeePercentages,
      employees,
      cardNumber,
      cardExpiry,
      cardCvc,
    } = req.body;    
    
    // Llamamos a la capa de servicio pasando también los datos adicionales para tarjeta.
    const receipt = createTipService({
      total,
      method,
      divisionType,
      numberOfEmployees,
      employeePercentages,
      employees,
      cardNumber,
      cardExpiry,
      cardCvc,
    });
    
    // Respuesta con el recibo
    return res.status(201).json(receipt);
  } catch (error: any) {
    // Si hay un error, lo retornamos con estado 400 (Bad Request)
    return res.status(400).json({ error: error.message });
  }
};