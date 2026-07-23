<template>
  <section id="photos" class="section section--accent photos">
    <span class="section-eyebrow">Momentos</span>
    <h2 class="section-title">Nuestros Recuerdos</h2>
    <div class="section-divider"></div>
    <div class="carousel" role="region" aria-label="Galería de fotos">
      <button
        class="carousel-btn prev"
        @click="prev"
        aria-label="Foto anterior"
      >
        <span aria-hidden="true">&#10094;</span>
      </button>

      <div class="carousel-viewport">
        <Transition name="fade" mode="out-in">
          <div
            :key="currentIndex"
            class="carousel-item"
            role="img"
            :aria-label="photos[currentIndex].alt"
          >
            <img
              :src="photos[currentIndex].src"
              :alt="photos[currentIndex].alt"
              loading="lazy"
            />
          </div>
        </Transition>
      </div>

      <button
        class="carousel-btn next"
        @click="next"
        aria-label="Siguiente foto"
      >
        <span aria-hidden="true">&#10095;</span>
      </button>
    </div>

    <div
      class="carousel-dots"
      role="tablist"
      aria-label="Indicadores de fotos"
    >
      <button
        v-for="(_, index) in photos"
        :key="index"
        role="tab"
        :aria-selected="index === currentIndex"
        :aria-label="`Ir a foto ${index + 1} de ${photos.length}`"
        :class="{ active: index === currentIndex }"
        @click="currentIndex = index"
      ></button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { photos } from '../data/wedding.js'

const currentIndex = ref(0)

function prev() {
  currentIndex.value = currentIndex.value === 0 ? photos.length - 1 : currentIndex.value - 1
}

function next() {
  currentIndex.value = currentIndex.value === photos.length - 1 ? 0 : currentIndex.value + 1
}
</script>

<style scoped>
.photos {
  background-color: var(--color-background);
}

.carousel {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
}

.carousel-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-primary);
  cursor: pointer;
  padding: 12px;
  border-radius: 50%;
  transition: background-color 0.2s ease, opacity 0.2s ease;
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-btn:hover {
  background-color: rgba(94, 146, 134, 0.1);
}

.carousel-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.carousel-viewport {
  flex: 1;
  overflow: hidden;
  border-radius: 16px;
}

.carousel-item {
  display: flex;
  justify-content: center;
}

.carousel-item img {
  width: 100%;
  max-height: 450px;
  object-fit: cover;
  border-radius: 16px;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.carousel-dots button {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--color-border);
  cursor: pointer;
  border: none;
  padding: 0;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.carousel-dots button:hover {
  transform: scale(1.2);
}

.carousel-dots button.active {
  background-color: var(--color-primary);
}

.carousel-dots button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>