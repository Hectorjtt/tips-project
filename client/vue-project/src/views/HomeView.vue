<template>
  <div class="home">
    <div class="content">
      <h1>Pago de Propinas</h1>
      <TipForm />
    </div>
  </div>
</template>

<script setup lang="ts">
import TipForm from '@/components/TipForm.vue'
</script>

<style scoped>
.home {
  /* Hace que este contenedor ocupe todo el alto de la ventana */
  min-height: 100vh;  
  display: flex;
  justify-content: flex-end; /* Alinea el contenido a la derecha */
  align-items: center;       /* Centra verticalmente */
  background-color: #1a1a1a;  /* Fondo oscuro (opcional) */
  padding-right: 2rem;       /* Espacio desde el borde derecho */
}

.content {
  /* Contenedor del formulario */
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  width: 400px;  /* Ajusta el ancho según tus necesidades */
  color: #000;   /* Texto en negro */
}

h1 {
  text-align: center;
}
</style>