<template>
  <Teleport to="body">
    <div
      class="lightbox"
      role="dialog"
      aria-modal="true"
      :aria-label="`Foto ${currentIndex + 1} de ${photos.length}: ${currentPhoto.alt}`"
      @click.self="close"
      @touchstart.passive="onTouchStart"
      @touchmove.passive="onTouchMove"
      @touchend="onTouchEnd"
    >
      <button
        ref="closeBtn"
        class="lightbox-close"
        type="button"
        @click="close"
        aria-label="Cerrar galería"
      >
        <span aria-hidden="true">&times;</span>
      </button>

      <button
        v-if="photos.length > 1"
        class="lightbox-prev"
        type="button"
        @click="prev"
        aria-label="Foto anterior"
      >
        <span aria-hidden="true">&#10094;</span>
      </button>

      <figure class="lightbox-content" @click.stop>
        <img
          :key="currentPhoto.id"
          :srcset="currentPhoto.full.srcset"
          :sizes="currentPhoto.full.sizes"
          :src="currentPhoto.full.src"
          :width="LIGHTBOX_WIDTH"
          :height="LIGHTBOX_HEIGHT"
          :alt="currentPhoto.alt"
          decoding="async"
        />
        <figcaption class="lightbox-caption">
          <span>{{ currentPhoto.alt }}</span>
          <span class="lightbox-counter">{{ currentIndex + 1 }} / {{ photos.length }}</span>
        </figcaption>
      </figure>

      <button
        v-if="photos.length > 1"
        class="lightbox-next"
        type="button"
        @click="next"
        aria-label="Siguiente foto"
      >
        <span aria-hidden="true">&#10095;</span>
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

const LIGHTBOX_WIDTH = 1600
const LIGHTBOX_HEIGHT = 1200

type Photo = {
  id: number
  alt: string
  thumb: { srcset: string; sizes: string; src: string }
  full: { srcset: string; sizes: string; src: string }
}

const props = defineProps<{
  photos: Photo[]
  initialIndex: number
}>()

const emit = defineEmits<{
  close: []
}>()

const currentIndex = ref(props.initialIndex)
const closeBtn = ref<HTMLButtonElement | null>(null)

const currentPhoto = computed(() => props.photos[currentIndex.value])

function close() {
  emit('close')
}

function prev() {
  currentIndex.value =
    currentIndex.value === 0 ? props.photos.length - 1 : currentIndex.value - 1
}

function next() {
  currentIndex.value =
    currentIndex.value === props.photos.length - 1 ? 0 : currentIndex.value + 1
}

function preload(index: number) {
  const photo = props.photos[index]
  if (!photo) return
  const img = new Image()
  img.decoding = 'async'
  img.src = photo.full.src
}

function preloadAdjacent() {
  if (props.photos.length < 2) return
  const prevIdx = currentIndex.value === 0 ? props.photos.length - 1 : currentIndex.value - 1
  const nextIdx = currentIndex.value === props.photos.length - 1 ? 0 : currentIndex.value + 1
  preload(prevIdx)
  preload(nextIdx)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowLeft') prev()
  else if (e.key === 'ArrowRight') next()
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
    if (dx > 0) prev()
    else next()
  }
}

watch(currentIndex, () => {
  preloadAdjacent()
})

onMounted(() => {
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', handleKeydown)
  preloadAdjacent()
  nextTick(() => closeBtn.value?.focus())
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.92);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 70px;
  animation: lightbox-fade 0.2s ease;
}

@keyframes lightbox-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.lightbox-content {
  max-width: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.lightbox-content img {
  display: block;
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.lightbox-caption {
  color: var(--color-white);
  text-align: center;
  font-size: 0.95rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lightbox-counter {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  letter-spacing: 0.1em;
}

.lightbox-close,
.lightbox-prev,
.lightbox-next {
  position: absolute;
  background: none;
  border: none;
  color: var(--color-white);
  cursor: pointer;
  border-radius: 50%;
  min-width: 48px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  font-size: 1.5rem;
  line-height: 1;
}

.lightbox-close {
  top: 16px;
  right: 16px;
  font-size: 2.5rem;
}

.lightbox-prev {
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.lightbox-next {
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.lightbox-close:hover,
.lightbox-prev:hover,
.lightbox-next:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.lightbox-close:focus-visible,
.lightbox-prev:focus-visible,
.lightbox-next:focus-visible {
  outline: 2px solid var(--color-white);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .lightbox {
    padding: 50px 12px 20px;
  }
  .lightbox-prev,
  .lightbox-next {
    min-width: 40px;
    min-height: 40px;
    font-size: 1.2rem;
  }
  .lightbox-content img {
    max-height: 65vh;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lightbox {
    animation: none;
  }
}
</style>
