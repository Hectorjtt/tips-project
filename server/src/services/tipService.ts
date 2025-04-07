// src/services/tipService.ts

// Define la estructura de los datos para crear un recibo de propinas
interface CreateTipData {
  total: number;
  method: string;
  divisionType: string;
  numberOfEmployees?: number;
  employeePercentages?: number[]; // Para división por porcentaje
  employees?: Array<{ id: number }>;
  cardNumber?: string; // Datos para pagos con tarjeta
  cardExpiry?: string;
  cardCvc?: string;
}

// Define la estructura de un recibo de propinas
interface TipReceipt {
  total: number;
  method: string;
  divisionType: string;
  distribution: Array<{ employeeId: number; amount: number }>;
  createdAt: string;
  paymentMessage?: string;
}

// Base de datos en memoria para guardar todos los recibos
const tipsMemoryDB: TipReceipt[] = [];

// Función que procesa la transacción y genera el recibo
export const createTipService = (data: CreateTipData) => {
  console.log("Datos recibidos en createTipService:", data);
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
  } = data;

  // Validación básica del monto y del método de pago
  if (!total || total <= 0) {
    throw new Error("El monto total debe ser válido.");
  }
  if (!method) {
    throw new Error("Se debe especificar el método de pago.");
  }

  // Inicializamos variables para comisión y mensaje de pago
  let commission = 0;
  let effectiveTotal = total;
  let paymentMessage = "";

  // Si el método es tarjeta, se requieren datos extra y se aplica comisión del 2%
  if (method === "tarjeta") {
    if (!cardNumber || !cardExpiry || !cardCvc) {
      throw new Error("Para pagos con tarjeta, se deben proporcionar número de tarjeta, fecha de vencimiento y CVC.");
    }
    commission = total * 0.02;
    effectiveTotal = total - commission;
    paymentMessage = `Pago realizado con tarjeta. Se aplicó una comisión de ${commission.toFixed(2)}.`;
  } else if (method === "efectivo") {
    paymentMessage = "Pago realizado en efectivo.";
  }

  // Calcula la distribución de propinas entre empleados
  let distribution: Array<{ employeeId: number; amount: number }> = [];
  if (divisionType === "igual") {
    if (numberOfEmployees && numberOfEmployees > 0) {
      const amountPerEmployee = effectiveTotal / numberOfEmployees;
      distribution = Array.from({ length: numberOfEmployees }, (_, i) => ({
        employeeId: i + 1,
        amount: parseFloat(amountPerEmployee.toFixed(2)),
      }));
    } else if (employees && employees.length > 0) {
      const amountPerEmployee = effectiveTotal / employees.length;
      distribution = employees.map(emp => ({
        employeeId: emp.id,
        amount: parseFloat(amountPerEmployee.toFixed(2)),
      }));
    } else {
      const defaultEmployees = 2;
      const amountPerEmployee = effectiveTotal / defaultEmployees;
      distribution = Array.from({ length: defaultEmployees }, (_, i) => ({
        employeeId: i + 1,
        amount: parseFloat(amountPerEmployee.toFixed(2)),
      }));
    }
  } else if (divisionType === "porcentaje") {
    if (!employeePercentages || employeePercentages.length === 0) {
      throw new Error("Debe proporcionar los porcentajes para cada empleado.");
    }
    const sumPercentages = employeePercentages.reduce((acc, val) => acc + val, 0);
    if (Math.abs(sumPercentages - 100) > 0.1) {
      throw new Error("La suma de los porcentajes debe ser 100.");
    }
    distribution = employeePercentages.map((percent, index) => {
      const amount = effectiveTotal * (percent / 100);
      return {
        employeeId: index + 1,
        amount: parseFloat(amount.toFixed(2)),
      };
    });
  }

  // Crea el recibo con todos los datos procesados
  const receipt: TipReceipt = {
    total,
    method,
    divisionType,
    distribution,
    createdAt: new Date().toISOString(),
    paymentMessage,
  };

  // Guarda el recibo en la base de datos en memoria
  tipsMemoryDB.push(receipt);
  console.log("Recibo generado:", receipt);
  return receipt;
};

// Función para devolver todos los recibos guardados en memoria
export const getAllTips = (): TipReceipt[] => {
  return tipsMemoryDB;
};