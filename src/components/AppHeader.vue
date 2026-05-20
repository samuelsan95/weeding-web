<template>
  <header class="header">
    <div class="header-content">
      <button
        class="hamburger"
        :class="{ active: isOpen }"
        @click="toggleMenu"
        :aria-expanded="isOpen"
        aria-controls="main-nav"
        aria-label="Menú de navegación"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </button>
      <nav id="main-nav" class="nav" :class="{ open: isOpen }" aria-label="Navegación principal">
        <a
          v-for="item in menuItems"
          :key="item.href"
          :href="item.href"
          @click="closeMenu"
        >
          {{ item.label }}
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)

const menuItems = [
  { label: 'Nosotros', href: '#date' },
  { label: 'Dónde', href: '#location' },
  { label: 'Horario', href: '#schedule' },
  { label: 'Confirmar', href: '#confirmation' },
  { label: 'Música', href: '#songs' },
  { label: 'Fotos', href: '#photos' }
]

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: var(--color-primary);
  z-index: 1000;
  padding: 15px 20px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.hamburger:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.hamburger:focus-visible {
  outline: 2px solid var(--color-white);
  outline-offset: 2px;
}

.hamburger span {
  width: 24px;
  height: 2px;
  background-color: var(--color-white);
  border-radius: 2px;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

.nav {
  display: flex;
  gap: 32px;
}

.nav a {
  color: var(--color-white);
  text-decoration: none;
  font-size: 0.95rem;
  transition: opacity 0.2s ease;
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  transition: opacity 0.2s ease, border-color 0.2s ease;
  font-size: var(--font-size-medium);
}

.nav a:hover {
  opacity: 0.85;
}

.nav a:focus-visible {
  outline: 2px solid var(--color-white);
  outline-offset: 4px;
}

.nav a:active {
  border-bottom-color: var(--color-white);
}

@media (max-width: 768px) {
  .header-content {
    justify-content: flex-start;
  }

  .hamburger {
    display: flex;
  }

  .nav {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background-color: var(--color-primary);
    flex-direction: column;
    align-items: center;
    padding: 24px 20px;
    gap: 24px;
    transform: translateY(-100%);
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
    pointer-events: none;
  }

  .nav.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }

  .nav a {
    font-size: 1.1rem;
  }
}
</style>