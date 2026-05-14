<template>
  <section id="photos" class="section photos">
    <h2 class="section-title">Nuestros Recuerdos</h2>
    <div class="carousel">
      <button class="carousel-btn prev" @click="prev" aria-label="Anterior">
        &#10094;
      </button>
      <div class="carousel-track">
        <div class="carousel-item" v-for="(photo, index) in photos" :key="photo.id" v-show="index === currentIndex">
          <img :src="photo.src" :alt="photo.alt" />
        </div>
      </div>
      <button class="carousel-btn next" @click="next" aria-label="Siguiente">
        &#10095;
      </button>
    </div>
    <div class="carousel-dots">
      <span v-for="(_, index) in photos" :key="index" :class="{ active: index === currentIndex }" @click="currentIndex = index"></span>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { photos } from '../data/wedding.js'

const currentIndex = ref(0)

const prev = () => {
  currentIndex.value = currentIndex.value === 0 ? photos.length - 1 : currentIndex.value - 1
}

const next = () => {
  currentIndex.value = currentIndex.value === photos.length - 1 ? 0 : currentIndex.value + 1
}
</script>

<style scoped>
.photos {
  background-color: var(--color-white);
}

.carousel {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 20px;
}

.carousel-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--color-primary);
  cursor: pointer;
  padding: 10px;
  transition: opacity 0.3s;
}

.carousel-btn:hover {
  opacity: 0.7;
}

.carousel-track {
  flex: 1;
  overflow: hidden;
}

.carousel-item {
  display: flex;
  justify-content: center;
}

.carousel-item img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.carousel-dots span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--color-border);
  cursor: pointer;
  transition: background-color 0.3s;
}

.carousel-dots span.active {
  background-color: var(--color-primary);
}
</style>