<template>
  <section id="location" class="section location">
    <h2 class="section-title">Dónde</h2>
    <div class="location-content">
      <img src="../assets/finca.png" alt="Finca Los Rosales de Cubas" class="location-image" />
      <div class="location-info">
        <h3>{{ location.name }}</h3>
        <p>{{ location.address }}</p>
        <a :href="location.mapsUrl" target="_blank" rel="noopener noreferrer" class="btn-maps">
          <img src="../assets/map.svg" alt="" class="btn-icon" aria-hidden="true" />
          Ver mapa
        </a>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { location } from '../data/wedding.js'
</script>

<style scoped>
.location {
  background-color: var(--color-background);
}

.location-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.location-image {
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 16px;
}

.location-info {
  text-align: center;
}

.location-info h3 {
  font-size: var(--font-size-large);
  color: var(--color-primary);
  margin-bottom: 10px;
  font-weight: normal;
}

.location-info p {
  font-size: var(--font-size-small);
  margin-bottom: 20px;
  color: var(--color-text);
  white-space: pre-line;
  text-align: center;
}

.btn-maps {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 28px;
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  text-decoration: none;
  border-radius: 25px;
  font-size: var(--font-size-small);
  font-weight: 600;
}

.btn-maps:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-maps:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
</style>