<template>
  <section id="schedule" class="section schedule">
    <h2 class="section-title">Horario</h2>
    <div class="schedule-list">
      <div
        v-for="(item, index) in schedule"
        :key="item.event"
        class="schedule-item"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="schedule-time">{{ item.time }}</div>
        <div class="schedule-divider"></div>
        <div class="schedule-event">{{ item.event }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { schedule } from '../data/wedding.js'
</script>

<style scoped>
.schedule {
  background-color: var(--color-background);
  position: relative;
  overflow: hidden;
}

.schedule::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200%;
  height: 100%;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(94, 146, 134, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(196, 167, 125, 0.06) 0%, transparent 50%);
  pointer-events: none;
}

.schedule-list {
  max-width: 420px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: var(--color-white);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeSlideUp 0.5s ease-out forwards;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.schedule-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.schedule-time {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  min-width: 60px;
  font-family: 'DM Serif Display', serif;
}

.schedule-divider {
  width: 1px;
  height: 40px;
  background: linear-gradient(180deg, transparent, var(--color-border), transparent);
}

.schedule-event {
  font-size: 1rem;
  color: var(--color-text);
  flex: 1;
}

@keyframes fadeSlideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .schedule-item {
    opacity: 1;
    transform: none;
    animation: none;
  }
}
</style>