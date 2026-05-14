<template>
  <section id="schedule" class="section schedule">
    <h2 class="section-title">Horario</h2>
    <div class="schedule-list">
      <div v-for="item in schedule" :key="item.event" class="schedule-item">
        <span class="schedule-time">{{ item.time }}</span>
        <span class="schedule-event">{{ item.event }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { schedule } from '../data/wedding.js'
</script>

<style scoped>
.schedule {
  background-color: var(--color-background);
}

.schedule-list {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.schedule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: var(--color-white);
  border-radius: 8px;
  border: 1px solid var(--color-border);
}

.schedule-time {
  font-weight: bold;
  color: var(--color-primary);
}

.schedule-event {
  color: var(--color-text);
}
</style>