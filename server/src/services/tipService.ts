// src/services/tipService.ts

interface CreateTipData {
    total: number;
    method: string;
    divisionType: string;
    employees?: Array<{ id: number }>;
  }
  
  export const createTipService = (data: CreateTipData) => {
    const { total, method, divisionType, employees } = data;
  
    // 1. Validaciones
    if (!total || total <= 0) {
      throw new Error("El monto total debe ser válido.");
    }
  
    if (!method) {
      throw new Error("Se debe especificar el método de pago.");
    }
  
    // 2. Cálculo de la distribución
    let distribution: Array<{ employeeId: number; amount: number }> = [];
  
    // Ejemplo: si se divide 'igual' entre empleados
    if (divisionType === "igual" && employees && employees.length > 0) {
      const amountPerEmployee = total / employees.length;
      distribution = employees.map(emp => ({
        employeeId: emp.id,
        amount: amountPerEmployee
      }));
    }
  
    // Podrías agregar aquí lógica para dividir por porcentajes o más reglas
  
    // 3. Creación de un recibo (objeto) con los datos
    const receipt = {
      total,
      method,
      divisionType,
      distribution,
      createdAt: new Date().toISOString()
    };
  
    // 4. (Opcional) Guardar en una base de datos o archivo
    //   En este test, podemos simplemente retornar el recibo
    //   o, si usas MongoDB, guardarías el objeto en la BD.
  
    return receipt;
  };