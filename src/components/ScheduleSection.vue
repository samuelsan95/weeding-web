<template>
  <section id="schedule" class="section section--tall schedule">
    <div class="schedule-header">
      <span class="section-eyebrow">El gran día</span>
      <h2 class="section-title">Horarios</h2>
      <div class="title-flourish"></div>
    </div>

    <div class="schedule-timeline">
      <div
        v-for="(item, index) in schedule"
        :key="item.event"
        class="schedule-item"
      >
        <span class="schedule-label">{{ item.event }}</span>
        <span class="schedule-time">{{ item.time }}h</span>
        <div v-if="index < schedule.length - 1" class="schedule-line"></div>
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
}

.schedule-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-family: 'Meow Script', cursive;
  font-size: var(--font-size-xx-large);
  color: var(--color-primary);
  margin-bottom: 16px;
}

.title-flourish {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
  margin: 0 auto;
  position: relative;
}

.title-flourish::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background-color: var(--color-primary);
  border-radius: 50%;
}

.schedule-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.schedule-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.schedule-label {
  font-size: var(--font-size-large);
  font-weight: 700;
  color: var(--color-primary);
  font-family: 'Cormorant Garamond', serif;
}

.schedule-time {
  font-size: var(--font-size-medium);
  font-weight: 400;
  color: var(--color-primary);
  font-family: 'DM Serif Display', serif;
  margin-bottom: 16px;
}

.schedule-line {
  width: 2px;
  height: 40px;
  background-color: var(--color-primary-light);
}

.schedule-item:last-child .schedule-line {
  display: none;
}
</style>