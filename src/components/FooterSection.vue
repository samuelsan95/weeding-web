<template>
  <section id="footer" class="section footer">
    <div class="footer-content">
      <h2 class="section-title">¡Te esperamos con muchas ganas!</h2>
      <div class="footer-video-wrapper">
        <video
          :src="videoSrc"
          autoplay
          loop
          muted
          playsinline
          class="footer-video footer-video--fg"
        ></video>
      </div>
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

.footer-video-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
  overflow: hidden;
}

.footer-video {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}
</style>
