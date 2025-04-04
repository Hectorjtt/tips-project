// src/services/tipService.ts

interface CreateTipData {
  total: number;
  method: string;
  divisionType: string;
  numberOfEmployees?: number;
  // Si se usa porcentaje, esperamos recibir el arreglo de porcentajes:
  employeePercentages?: number[];
  employees?: Array<{ id: number }>;
  // Datos adicionales para pagos con tarjeta
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
}

interface TipReceipt {
  total: number;
  method: string;
  divisionType: string;
  distribution: Array<{ employeeId: number; amount: number }>;
  createdAt: string;
  paymentMessage?: string;
}

const tipsMemoryDB: TipReceipt[] = [];

export const createTipService = (data: CreateTipData) => {
  console.log("Datos recibidos en createTipService:", data);
  const { total, method, divisionType, numberOfEmployees, employeePercentages, employees, cardNumber, cardExpiry, cardCvc } = data;

  if (!total || total <= 0) {
    throw new Error("El monto total debe ser válido.");
  }
  if (!method) {
    throw new Error("Se debe especificar el método de pago.");
  }

  // Inicializamos comisión y mensaje de pago
  let commission = 0;
  let effectiveTotal = total;
  let paymentMessage = "";

  // Si se selecciona "tarjeta", requerimos datos extra y aplicamos comisión
  if (method === "tarjeta") {
    if (!cardNumber || !cardExpiry || !cardCvc) {
      throw new Error("Para pagos con tarjeta, se deben proporcionar número de tarjeta, fecha de vencimiento y CVC.");
    }
    // Ejemplo: comisión del 2%
    commission = total * 0.02;
    effectiveTotal = total - commission;
    paymentMessage = `Pago realizado con tarjeta. Se aplicó una comisión de ${commission.toFixed(2)}.`;
  } else if (method === "efectivo") {
    paymentMessage = "Pago realizado en efectivo.";
  }

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

  const receipt: TipReceipt = {
    total,
    method,
    divisionType,
    distribution,
    createdAt: new Date().toISOString(),
    paymentMessage,
  };

  tipsMemoryDB.push(receipt);
  console.log("Recibo generado:", receipt);
  return receipt;
};