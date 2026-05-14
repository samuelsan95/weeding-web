<template>
  <section id="footer" class="section footer">
    <div class="footer-content">
      <img src="../assets/logo.png" alt="Logo de la boda" class="footer-logo" />
      <h2 class="footer-text">¡Te esperamos con muchas ganas!</h2>
    </div>
  </section>
</template>

<style scoped>
.footer {
  background-color: var(--color-primary);
  color: var(--color-white);
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.illustration {
  width: 150px;
  height: 150px;
}

.footer-text {
  font-size: 1.5rem;
  font-weight: normal;
  text-align: center;
}
</style>