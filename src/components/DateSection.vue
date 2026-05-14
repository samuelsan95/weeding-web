<template>
  <section id="hero" class="hero">
    <div class="hero-bg-pattern"></div>
    <div class="hero-content">
      <img src="../assets/logo.png" alt="Logo de la boda" class="hero-logo" />
      <p class="hero-date">26 de Junio de 2027</p>
      <div class="countdown">
        <div class="countdown-item" v-for="unit in countdownUnits" :key="unit.label">
          <span class="countdown-value">{{ unit.value }}</span>
          <span class="countdown-label">{{ unit.label }}</span>
        </div>
      </div>
    </div>
    <div class="hero-decoration"></div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { weddingDate } from '../data/wedding.js'

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
let interval: ReturnType<typeof setInterval> | null = null

const countdownUnits = computed(() => [
  { value: String(days.value).padStart(2, '0'), label: 'Días' },
  { value: String(hours.value).padStart(2, '0'), label: 'Horas' },
  { value: String(minutes.value).padStart(2, '0'), label: 'Minutos' },
  { value: String(seconds.value).padStart(2, '0'), label: 'Segundos' }
])

function updateCountdown() {
  const now = new Date()
  const diff = weddingDate.getTime() - now.getTime()

  if (diff > 0) {
    days.value = Math.floor(diff / (1000 * 60 * 60 * 24))
    hours.value = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    minutes.value = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    seconds.value = Math.floor((diff % (1000 * 60)) / 1000)
  } else {
    days.value = 0
    hours.value = 0
    minutes.value = 0
    seconds.value = 0
  }
}

onMounted(() => {
  updateCountdown()
  interval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  padding: 80px 20px 60px;
  position: relative;
  overflow: hidden;
}

.hero-bg-pattern {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 30%, rgba(94, 146, 134, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(196, 167, 125, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(94, 146, 134, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.hero-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-logo {
  max-width: 300px;
  height: auto;
  margin-bottom: 24px;
  animation: fadeScale 0.8s ease-out 0.1s both;
}

.hero-date {
  font-size: 1.4rem;
  color: var(--color-primary);
  margin-bottom: 48px;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  animation: fadeSlideUp 0.6s ease-out 0.2s both;
}

.countdown {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 72px;
  padding: 16px 12px;
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(94, 146, 134, 0.12);
  animation: fadeSlideUp 0.5s ease-out both;
}

.countdown-item:nth-child(1) { animation-delay: 0.3s; }
.countdown-item:nth-child(2) { animation-delay: 0.4s; }
.countdown-item:nth-child(3) { animation-delay: 0.5s; }
.countdown-item:nth-child(4) { animation-delay: 0.6s; }

.countdown-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
  font-family: 'DM Serif Display', serif;
  letter-spacing: -0.02em;
}

.countdown-label {
  font-size: 0.75rem;
  color: var(--color-text);
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.hero-decoration {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  width: 300px;
  height: 100px;
  background: var(--color-primary);
  border-radius: 50% 50% 0 0;
  opacity: 0.05;
  pointer-events: none;
}

@keyframes fadeScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 480px) {
  .countdown {
    gap: 12px;
  }

  .countdown-item {
    min-width: 64px;
    padding: 12px 8px;
  }

  .countdown-value {
    font-size: 1.8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-logo,
  .hero-date,
  .countdown-item {
    animation: none;
    opacity: 1;
  }
}
</style>