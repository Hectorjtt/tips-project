// src/controllers/tipController.ts
import { Request, Response } from "express";
import { createTipService, getAllTips } from "../services/tipService";

// Procesa la creación de un recibo de propinas
export const createTip = (req: Request, res: Response) => {
  try {
    // Extraemos los datos enviados en el cuerpo de la solicitud
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

    // Llamamos al servicio para generar el recibo con la información recibida
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

    // Retornamos el recibo generado con un status 201
    return res.status(201).json(receipt);
  } catch (error: any) {
    // Si ocurre un error, lo devolvemos con status 400
    return res.status(400).json({ error: error.message });
  }
};

// Devuelve todos los recibos almacenados en el sistema
export const getTips = (req: Request, res: Response) => {
  try {
    // Obtenemos la lista completa de recibos
    const receipts = getAllTips();
    return res.status(200).json(receipts);
  } catch (error: any) {
    // En caso de error, devolvemos un status 400
    return res.status(400).json({ error: error.message });
  }
};