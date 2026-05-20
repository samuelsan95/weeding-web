<template>
  <section id="footer" class="section footer">
    <div class="footer-content">
      <h2 class="section-title">¡Te esperamos con muchas ganas!</h2>
      <img src="../assets/finca.png" alt="Logo de la boda" class="footer-logo" />
    </div>
  </section>
</template>

<style scoped>
.footer {
  background-color: var(--color-background);
  color: var(--color-white);
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.footer-logo {
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 16px;
}
</style>