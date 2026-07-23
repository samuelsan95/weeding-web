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
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const isOpen = ref(false)

const menuItems = [
  { label: 'Fecha', href: '#date' },
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

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) closeMenu()
}

function handleResize() {
  if (window.innerWidth > 768 && isOpen.value) closeMenu()
}

watch(isOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
  document.body.style.overflow = ''
})
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
  position: relative;
  z-index: 2;
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
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-primary);
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 80px 20px 24px;
    gap: 28px;
    transform: translateY(-100%);
    opacity: 0;
    transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1), opacity 0.3s ease;
    pointer-events: none;
    z-index: 1;
  }

  .nav.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }

  .nav a {
    font-size: 1.6rem;
    letter-spacing: 0.04em;
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.4s ease, transform 0.4s ease, border-color 0.2s ease;
  }

  .nav.open a {
    opacity: 1;
    transform: translateY(0);
  }

  .nav.open a:nth-child(1) { transition-delay: 0.08s; }
  .nav.open a:nth-child(2) { transition-delay: 0.12s; }
  .nav.open a:nth-child(3) { transition-delay: 0.16s; }
  .nav.open a:nth-child(4) { transition-delay: 0.20s; }
  .nav.open a:nth-child(5) { transition-delay: 0.24s; }
  .nav.open a:nth-child(6) { transition-delay: 0.28s; }
}
</style>