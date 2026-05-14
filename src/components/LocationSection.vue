<template>
  <section id="location" class="section location">
    <h2 class="section-title">Dónde</h2>
    <div class="location-content">
      <img src="../assets/finca.png" alt="Finca Los Rosales de Cubas" class="location-image" />
      <div class="location-info">
        <h3>{{ location.name }}</h3>
        <p>{{ location.address }}</p>
        <a :href="location.mapsUrl" target="_blank" rel="noopener noreferrer" class="btn-maps">
          Ver en Google Maps
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
import { location } from '../data/wedding.js'
</script>

<style scoped>
.location {
  background-color: var(--color-white);
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
  border-radius: 8px;
}

.location-info {
  text-align: center;
}

.location-info h3 {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: 10px;
  font-weight: normal;
}

.location-info p {
  font-size: 1rem;
  margin-bottom: 20px;
  color: var(--color-text);
}

.btn-maps {
  display: inline-block;
  padding: 12px 30px;
  background-color: var(--color-primary);
  color: var(--color-white);
  text-decoration: none;
  border-radius: 25px;
  transition: opacity 0.3s;
}

.btn-maps:hover {
  opacity: 0.9;
}
</style>