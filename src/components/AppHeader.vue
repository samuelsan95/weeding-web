<template>
  <header class="header">
    <div class="header-content">
      <button class="hamburger" :class="{ active: isOpen }" @click="toggleMenu" aria-label="Menú">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav class="nav" :class="{ open: isOpen }">
        <a v-for="item in menuItems" :key="item.href" :href="item.href" @click="closeMenu">
          {{ item.label }}
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

const menuItems = [
  { label: 'Nosotros', href: '#hero' },
  { label: 'Dónde', href: '#location' },
  { label: 'Horario', href: '#schedule' },
  { label: 'Confirmar', href: '#confirmation' },
  { label: 'Música', href: '#songs' },
  { label: 'Fotos', href: '#photos' }
]

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const closeMenu = () => {
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
  justify-content: flex-end;
  align-items: center;
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background-color: var(--color-white);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.nav {
  display: flex;
  gap: 30px;
}

.nav a {
  color: var(--color-white);
  text-decoration: none;
  font-size: 1rem;
  transition: opacity 0.3s;
}

.nav a:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
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
    padding: 20px;
    gap: 20px;
    transform: translateY(-100%);
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  .nav.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: all;
  }
}
</style>