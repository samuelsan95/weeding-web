<template>
  <section id="footer" class="section footer">
    <div class="footer-content">
      <h2 class="section-title">¡Te esperamos con muchas ganas!</h2>
    </div>
  </section>
</template>

<script setup>
import videoSrc from '../assets/video.mp4'
</script>

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
</style>
