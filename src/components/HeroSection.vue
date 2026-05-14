<template>
  <section id="hero" class="hero">
    <div class="hero-content">
      <img src="../assets/logo.png" alt="Logo de la boda" class="hero-logo" />
      <p class="hero-date">26 de Junio de 2027</p>
      <div class="countdown">
        <div class="countdown-item">
          <span class="countdown-value">{{ days }}</span>
          <span class="countdown-label">Días</span>
        </div>
        <div class="countdown-item">
          <span class="countdown-value">{{ hours }}</span>
          <span class="countdown-label">Horas</span>
        </div>
        <div class="countdown-item">
          <span class="countdown-value">{{ minutes }}</span>
          <span class="countdown-label">Minutos</span>
        </div>
        <div class="countdown-item">
          <span class="countdown-value">{{ seconds }}</span>
          <span class="countdown-label">Segundos</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { weddingDate } from '../data/wedding.js'

const days = ref(0)
const hours = ref(0)
const minutes = ref(0)
const seconds = ref(0)
let interval = null

const updateCountdown = () => {
  const now = new Date()
  const diff = weddingDate - now

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
  padding: 80px 20px 40px;
}

.hero-content {
  text-align: center;
}

.hero-logo {
  max-width: 200px;
  height: auto;
  margin-bottom: 20px;
}

.hero-date {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: 40px;
}

.countdown {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.countdown-value {
  font-size: 3rem;
  font-weight: bold;
  color: var(--color-primary);
  line-height: 1;
}

.countdown-label {
  font-size: 0.875rem;
  color: var(--color-primary);
  margin-top: 5px;
}

@media (max-width: 480px) {
  .countdown {
    gap: 20px;
  }

  .countdown-value {
    font-size: 2rem;
  }
}
</style>