<template>
  <div class="tip-form">
    <h1>Pago de Propinas</h1>
    
    <!-- Formulario de ingreso de datos para la transacción -->
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="total">Monto Total:</label>
        <input type="number" id="total" v-model="form.total" />
      </div>
      
      <div class="form-group">
        <label for="numberOfEmployees">Número de Empleados:</label>
        <input
          type="number"
          id="numberOfEmployees"
          v-model.number="form.numberOfEmployees"
          min="1"
          @change="updateEmployeePercentages"
        />
      </div>
      
      <div class="form-group">
        <label for="method">Método de Pago:</label>
        <select id="method" v-model="form.method">
          <option value="">Selecciona un método</option>
          <option value="efectivo">Efectivo</option>
          <option value="tarjeta">Tarjeta</option>
        </select>
      </div>
      
      <!-- Muestra la nota de comisión si se selecciona el método tarjeta -->
      <div class="commission-info" v-if="form.method === 'tarjeta'">
        <p><em>Nota: Se aplicará una comisión del 2% al monto total por pago con tarjeta.</em></p>
      </div>
      
      <!-- Campos adicionales para el pago con tarjeta -->
      <div v-if="form.method === 'tarjeta'">
        <div class="form-group">
          <label for="cardNumber">Número de Tarjeta:</label>
          <input type="text" id="cardNumber" v-model="form.cardNumber" />
        </div>
        <div class="form-group">
          <label for="cardExpiry">Fecha de Vencimiento (MM/AA):</label>
          <input type="text" id="cardExpiry" v-model="form.cardExpiry" />
        </div>
        <div class="form-group">
          <label for="cardCvc">CVC:</label>
          <input type="text" id="cardCvc" v-model="form.cardCvc" />
        </div>
      </div>
      
      <div class="form-group">
        <label for="divisionType">División:</label>
        <select id="divisionType" v-model="form.divisionType">
          <option value="igual">Igual</option>
          <option value="porcentaje">Porcentaje</option>
        </select>
      </div>
      
      <!-- Sección para asignar porcentajes si se elige división por porcentaje -->
      <div class="form-group" v-if="form.divisionType === 'porcentaje'">
        <label>Asignar Porcentajes (la suma debe ser 100):</label>
        <div v-for="(percent, index) in form.employeePercentages" :key="index">
          <label>Empleado {{ index + 1 }}:</label>
          <input type="number" v-model.number="form.employeePercentages[index]" min="0" max="100" />
        </div>
      </div>
      
      <!-- Botón para enviar la transacción -->
      <button type="submit">Enviar</button>
    </form>
    
    <!-- Muestra el recibo generado después de enviar la transacción -->
    <div v-if="receipt" class="receipt">
      <h2>Recibo Generado</h2>
      <p><strong>Total:</strong> {{ receipt.total }}</p>
      <p><strong>Número de Empleados:</strong> {{ form.numberOfEmployees }}</p>
      <p><strong>Método:</strong> {{ receipt.method }}</p>
      <p><strong>División:</strong> {{ receipt.divisionType }}</p>
      <p v-if="receipt.paymentMessage"><strong>Comisión:</strong> {{ receipt.paymentMessage }}</p>
      
      <p v-if="form.divisionType === 'porcentaje'">
        <strong>Porcentajes Asignados:</strong>
      </p>
      <ul v-if="form.divisionType === 'porcentaje'">
        <li v-for="(percent, index) in form.employeePercentages" :key="index">
          Empleado {{ index + 1 }}: {{ percent }}%
        </li>
      </ul>
      
      <p v-if="form.divisionType === 'igual'">
        <strong>Distribución:</strong>
      </p>
      <ul v-if="form.divisionType === 'igual'">
        <li v-for="(dist, index) in receipt.distribution" :key="index">
          Empleado {{ dist.employeeId }}: {{ dist.amount.toFixed(2) }}
        </li>
      </ul>
      
      <p v-if="form.divisionType === 'porcentaje'">
        <strong>Distribución Calculada:</strong>
      </p>
      <ul v-if="form.divisionType === 'porcentaje'">
        <li v-for="(dist, index) in receipt.distribution" :key="index">
          Empleado {{ dist.employeeId }}: {{ dist.amount.toFixed(2) }}
        </li>
      </ul>
      
      <p><strong>Creado:</strong> {{ receipt.createdAt }}</p>
    </div>
    
    <!-- Botón para obtener y mostrar todos los recibos almacenados -->
    <button type="button" @click="fetchReceipts" class="show-receipts">
      Mostrar Todos los Recibos
    </button>
    
    <!-- Sección que muestra la lista de todos los recibos -->
    <div v-if="allReceipts.length" class="receipts-list">
      <h2>Todos los Recibos</h2>
      <div v-for="(rec, idx) in allReceipts" :key="idx" class="receipt-item">
        <p><strong>Total:</strong> {{ rec.total }}</p>
        <p><strong>Método:</strong> {{ rec.method }}</p>
        <p><strong>División:</strong> {{ rec.divisionType }}</p>
        <p v-if="rec.paymentMessage"><strong>Comisión:</strong> {{ rec.paymentMessage }}</p>
        <p><strong>Distribución:</strong></p>
        <ul>
          <li v-for="(dist, i) in rec.distribution" :key="i">
            Empleado {{ dist.employeeId }}: {{ dist.amount.toFixed(2) }}
          </li>
        </ul>
        <p><strong>Creado:</strong> {{ rec.createdAt }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import axios from 'axios'

export default defineComponent({
  name: 'TipForm',
  setup() {
    // Objeto que contiene todos los datos del formulario, incluyendo campos de tarjeta
    const form = ref({
      total: 0,
      method: '',
      divisionType: 'igual',
      numberOfEmployees: 2,
      employeePercentages: [] as number[],
      cardNumber: '',
      cardExpiry: '',
      cardCvc: ''
    })

    // Variable reactiva para almacenar la lista de recibos consultados
    const allReceipts = ref<any[]>([])

    // Función que asigna porcentajes iguales basado en el número de empleados
    const updateEmployeePercentages = () => {
      form.value.employeePercentages = Array.from(
        { length: form.value.numberOfEmployees },
        () => parseFloat((100 / form.value.numberOfEmployees).toFixed(2))
      )
    }

    // Actualiza los porcentajes si cambia el número de empleados y se usa división por porcentaje
    watch(() => form.value.numberOfEmployees, () => {
      if (form.value.divisionType === 'porcentaje') {
        updateEmployeePercentages()
      }
    })

    // Reinicia los porcentajes cuando se cambia a división por porcentaje
    watch(() => form.value.divisionType, (newType) => {
      if (newType === 'porcentaje') {
        updateEmployeePercentages()
      }
    })

    // Variable para almacenar el recibo generado después de enviar el formulario
    const receipt = ref<any>(null)

    // Envía la información del formulario al servidor para generar un recibo
    const handleSubmit = async () => {
      if (form.value.divisionType === 'porcentaje') {
        const sum = form.value.employeePercentages.reduce((acc: number, cur: number) => acc + cur, 0)
        if (Math.abs(sum - 100) > 0.1) {
          alert("La suma de los porcentajes debe ser 100")
          return
        }
      }
      console.log("Enviando datos del formulario:", form.value)
      try {
        const response = await axios.post('http://localhost:3000/api/tips', form.value)
        receipt.value = response.data
        console.log("Respuesta del servidor:", response.data)
      } catch (error) {
        console.error(error)
      }
    }

    // Función para obtener todos los recibos del servidor
    const fetchReceipts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/tips')
        allReceipts.value = response.data
      } catch (error) {
        console.error("Error al obtener recibos:", error)
      }
    }

    // Se establecen los porcentajes iniciales
    updateEmployeePercentages()

    return {
      form,
      receipt,
      handleSubmit,
      updateEmployeePercentages,
      fetchReceipts,
      allReceipts
    }
  }
})
</script>

<style scoped>
.tip-form {
  max-width: 450px;
  margin: -1rem -7rem 2rem auto;
  font-family: Arial, sans-serif;
  border: 1px solid #ddd;
  padding: 1rem 2rem;
  border-radius: 4px;
  background-color: #fdfdfd;
}
.tip-form h1 {
  margin-top: 0;
  text-align: center;
  color: #007acc;
  padding-bottom: 0.5rem;
}
.form {
  display: flex;
  flex-direction: column;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  color: #000;
  font-weight: bold;
  margin-bottom: 0.25rem;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button[type="submit"] {
  padding: 0.5rem 1rem;
  background-color: #007acc;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  align-self: flex-start;
}
button[type="submit"]:hover {
  background-color: #005fa3;
}
.show-receipts {
  padding: 0.5rem 1rem;
  background-color: #28a745;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  margin-top: 1rem;
}
.show-receipts:hover {
  background-color: #218838;
}
.receipts-list {
  margin-top: 2rem;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
}
.receipts-list h2 {
  color: #000;
}
.receipt-item {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ddd;
  color: #000;
}
.receipt {
  margin-top: 1.5rem;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 1rem;
  color: #000;
}
.receipt h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  text-align: center;
  color: #000;
}
.receipt p {
  margin: 0.5rem 0;
  color: #000;
}
.receipt ul {
  list-style-type: none;
  padding-left: 0;
}
.receipt li {
  margin-bottom: 0.25rem;
  color: #000;
}
.commission-info p {
  font-style: italic;
  color: #a00;
  padding-bottom: 0.5rem;
}
.receipts-list ul,
.receipt-item ul {
  list-style: none !important;
  padding-left: 0;
}
</style>