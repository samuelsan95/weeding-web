<template>
  <section id="footer" class="section section--primary section--tall footer">
    <div class="footer-content">
      <p class="footer-eyebrow">26 · 06 · 2027</p>
      <h2 class="section-title">¡Te esperamos con muchas ganas!</h2>
      <p class="footer-names">Irene y Samuel</p>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.footer {
  color: var(--color-white);
  text-align: center;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.footer-eyebrow {
  font-size: var(--font-size-medium);
  letter-spacing: 0.5em;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.footer-names {
  font-family: 'Meow Script', cursive;
  font-size: 2.4rem;
  color: var(--color-white);
  margin-top: 24px;
}
</style>
