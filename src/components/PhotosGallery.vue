<template>
  <section id="photos" class="section section--accent photos">
    <span class="section-eyebrow">Momentos</span>
    <h2 class="section-title">Nuestros Recuerdos</h2>
    <div class="section-divider"></div>

    <div
      class="peek-carousel"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
    >
      <button
        v-for="(photo, index) in photos"
        :key="photo.id"
        class="peek-slide"
        :class="getSlideClass(index)"
        type="button"
        :aria-label="getAriaLabel(index)"
        :aria-current="index === currentIndex ? 'true' : undefined"
        @click="handleClick(index)"
      >
        <img
          :src="photo.src"
          :alt="index === currentIndex ? photo.alt : ''"
          loading="lazy"
          decoding="async"
        />
      </button>
    </div>

    <div
      v-if="photos.length > 1"
      class="peek-dots"
      role="tablist"
      aria-label="Selector de foto"
    >
      <button
        v-for="(_, index) in photos"
        :key="index"
        type="button"
        role="tab"
        :aria-selected="index === currentIndex"
        :aria-label="`Ir a foto ${index + 1} de ${photos.length}`"
        :class="{ active: index === currentIndex }"
        @click="currentIndex = index"
      ></button>
    </div>

    <Lightbox
      v-if="lightboxOpen"
      :photos="photos"
      :initial-index="currentIndex"
      @close="closeLightbox"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { photos } from '../data/wedding.js'
import Lightbox from './Lightbox.vue'

const currentIndex = ref(0)
const lightboxOpen = ref(false)

const prevIndex = computed(() => {
  if (photos.length < 3) return null
  return currentIndex.value === 0 ? photos.length - 1 : currentIndex.value - 1
})

const nextIndex = computed(() => {
  if (photos.length < 3) return null
  return currentIndex.value === photos.length - 1 ? 0 : currentIndex.value + 1
})

function getSlideClass(index: number) {
  if (index === currentIndex.value) return 'peek-active'
  if (index === prevIndex.value) return 'peek-prev'
  if (index === nextIndex.value) return 'peek-next'
  return 'peek-hidden'
}

function getAriaLabel(index: number) {
  if (index === currentIndex.value) return `Abrir galería: ${photos[index].alt}`
  return `Ir a foto: ${photos[index].alt}`
}

function handleClick(index: number) {
  if (index === currentIndex.value) {
    lightboxOpen.value = true
  } else {
    currentIndex.value = index
  }
}

function closeLightbox() {
  lightboxOpen.value = false
}

let touchStartX = 0
let touchStartY = 0
let touchEndX = 0
let touchEndY = 0
const SWIPE_THRESHOLD = 50

function onTouchStart(e: TouchEvent) {
  touchStartX = e.changedTouches[0].screenX
  touchStartY = e.changedTouches[0].screenY
  touchEndX = touchStartX
  touchEndY = touchStartY
}

function onTouchMove(e: TouchEvent) {
  touchEndX = e.changedTouches[0].screenX
  touchEndY = e.changedTouches[0].screenY
}

function onTouchEnd() {
  const dx = touchEndX - touchStartX
  const dy = touchEndY - touchStartY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
    if (dx > 0 && prevIndex.value !== null) currentIndex.value = prevIndex.value
    else if (dx < 0 && nextIndex.value !== null) currentIndex.value = nextIndex.value
  }
}
</script>

<style scoped>
.photos {
  background-color: var(--color-background);
}

.peek-carousel {
  position: relative;
  width: 100%;
  height: 60vh;
  max-height: 500px;
  min-height: 320px;
  margin: 0 auto;
  max-width: 1200px;
}

.peek-slide {
  position: absolute;
  top: 0;
  bottom: 0;
  border: none;
  padding: 0;
  background-color: var(--color-border);
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
  transition:
    left 0.5s cubic-bezier(0.2, 0.7, 0.2, 1),
    right 0.5s cubic-bezier(0.2, 0.7, 0.2, 1),
    width 0.5s cubic-bezier(0.2, 0.7, 0.2, 1),
    opacity 0.4s ease,
    transform 0.3s ease,
    box-shadow 0.3s ease,
    filter 0.4s ease;
}

.peek-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.peek-active {
  left: 15%;
  width: 70%;
  z-index: 1;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);
}

.peek-active:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.22);
}

.peek-prev {
  right: 85%;
  width: 30%;
  opacity: 0.5;
  filter: blur(2px);
}

.peek-prev:hover,
.peek-next:hover {
  opacity: 0.85;
  filter: none;
}

.peek-next {
  left: 85%;
  width: 30%;
  opacity: 0.5;
  filter: blur(2px);
}

.peek-hidden {
  opacity: 0;
  pointer-events: none;
  width: 0;
  left: 50%;
}

.peek-slide:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 3px;
}

.peek-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.peek-dots button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--color-border);
  cursor: pointer;
  border: none;
  padding: 0;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.peek-dots button:hover {
  transform: scale(1.2);
}

.peek-dots button.active {
  background-color: var(--color-primary);
}

.peek-dots button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .peek-carousel {
    height: 50vh;
    min-height: 280px;
  }
  .peek-prev {
    right: 92%;
    width: 22%;
    opacity: 0.4;
  }
  .peek-next {
    left: 92%;
    width: 22%;
    opacity: 0.4;
  }
}

@media (prefers-reduced-motion: reduce) {
  .peek-slide {
    transition: opacity 0.2s ease;
  }
  .peek-active:hover {
    transform: none;
  }
}
</style>
