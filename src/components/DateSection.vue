<template>
  <section id="date" class="date">
    <div class="date-content">
      <img src="../assets/logo.png" alt="Logo de la boda" class="date-logo" />
      <div class="date-welcome">
        <div class="welcome">
          <h2 class="section-title">¡Nos vamos a casar!</h2>
          <p class="welcome-text">Y queremos compartir este día tan especial junto a las personas que más queremos.</p>
          <p class="date-date">26 de Junio de 2027</p>
        </div>
        <div class="countdown">
          <div class="countdown-item" v-for="unit in countdownUnits" :key="unit.label">
            <span class="countdown-value">{{ unit.value }}</span>
            <span class="countdown-label">{{ unit.label }}</span>
        </div>
      </div>
      </div>
    </div>
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
.date {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  padding: 80px 20px 60px;
  position: relative;
  overflow: hidden;
}

.date-content {
  text-align: center;
  position: relative;
  z-index: 1;
}

.date-logo {
  max-width: 300px;
  height: auto;
  animation: fadeScale 0.8s ease-out 0.1s both;
}

.date-date {
  font-size: var(--font-size-x-large);
  color: var(--color-primary);
  margin-bottom: 48px;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  animation: fadeSlideUp 0.6s ease-out 0.2s both;
}

.date-welcome {
  background-color: var(--color-primary-light);
  padding: 24px;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.welcome {
  text-align: center;
  margin-bottom: 48px;
}

.welcome > .section-title {
  margin-bottom: 0;
}

.welcome-text {
  font-size: var(--font-size-large);
  color: var(--color-primary);
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
  /* background: var(--color-white); */
  border-radius: 16px;
  /* box-shadow: 0 4px 20px rgba(94, 146, 134, 0.12); */
  animation: fadeSlideUp 0.5s ease-out both;
}

.countdown-item:nth-child(1) { animation-delay: 0.3s; }
.countdown-item:nth-child(2) { animation-delay: 0.4s; }
.countdown-item:nth-child(3) { animation-delay: 0.5s; }
.countdown-item:nth-child(4) { animation-delay: 0.6s; }

.countdown-value {
  font-size: var(--font-size-x-large);
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
  font-family: 'Meow Script', cursive;
  letter-spacing: -0.02em;
}

.countdown-label {
  font-size: var(--font-size-x-small);
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
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

@media (max-width: 768px) {
  .date {
    padding: 70px 16px 40px;
  }

  .date-content {
    width: 100%;
  }

  .date-date {
    margin-bottom: 32px;
  }

  .date-welcome {
    width: 100vw;
    max-width: 100vw;
    margin-left: calc(-50vw + 50%);
    padding: 20px;
    border-radius: 0;
  }

  .welcome {
    margin-bottom: 32px;
  }

  .countdown {
    gap: 12px;
    flex-wrap: nowrap;
  }

  .countdown-item {
    min-width: 64px;
    padding: 12px 8px;
  }

  .countdown-value {
    font-size: var(--font-size-large);
  }
}

@media (prefers-reduced-motion: reduce) {
  .date-logo,
  .date-date,
  .countdown-item {
    animation: none;
    opacity: 1;
  }
}
</style>