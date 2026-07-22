<script setup lang="ts">
import { useFootprintAnimation } from '../composables/useFootprintAnimation'

const { canvas, isReady } = useFootprintAnimation()
</script>

<template>
  <Teleport to="body">
    <canvas
      ref="canvas"
      class="footprint-canvas"
      :class="{ ready: isReady }"
      aria-hidden="true"
    ></canvas>
  </Teleport>
</template>

<style scoped>
/*
 * Layering contract:
 *   z-index 50  → footprint canvas (behind everything)
 *   z-index 101 → .section elements (defined in style.css)
 * Footprints render behind all content. Do NOT raise this above 100.
 */
.footprint-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 102;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.footprint-canvas.ready {
  opacity: 0.7;
}
</style>