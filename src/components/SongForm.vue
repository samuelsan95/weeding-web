<template>
  <section id="songs" class="section section--flush songs">
    <span class="section-eyebrow">Bailemos</span>
    <h2 class="section-title">Pide tus canciones</h2>
    <div class="section-divider"></div>

    <form class="form" @submit.prevent="submitForm" novalidate>
      <input
        type="text"
        name="company"
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
        class="honeypot"
        v-model="honeypot"
      />

      <div class="slots">
        <SongPicker
          v-for="(slot, i) in slots"
          :key="slot.id"
          ref="pickerRefs"
          v-model="slot.track"
          :index="i"
          :playing="playingIndex === i"
          @toggle-play="track => togglePlay(i, track)"
          @remove="removeSlot(slot.id)"
        />
      </div>

      <button
        v-if="canAddMore"
        type="button"
        class="btn-add"
        @click="addSlot"
      >
        <span class="btn-add-icon" aria-hidden="true">+</span>
        Añadir otra canción
        <span class="btn-add-count" aria-hidden="true">{{ slots.length }}/{{ MAX_SONGS }}</span>
      </button>

      <p v-if="!hasAnySong" class="hint">
        Busca y selecciona hasta {{ MAX_SONGS }} canciones para la fiesta.
      </p>

      <FormInput
        v-model="form.dedication"
        type="textarea"
        label="Dedicatoria para los novios"
        :maxlength="500"
        hint="Escribe una dedicatoria especial para los novios (opcional)"
      />

      <FormInput
        v-model="form.author"
        label="¿Quién lo escribe?"
        autocomplete="name"
        :maxlength="100"
        hint="Déjalo vacío si quieres que sea anónimo"
      />

      <button
        type="submit"
        class="btn-submit"
        :disabled="!canSubmit"
      >
        {{ submitLabel }}
      </button>

      <p
        v-if="message"
        class="form-message"
        :class="{ success: !sendError, error: sendError }"
        role="alert"
        aria-live="assertive"
      >
        {{ message }}
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onBeforeUnmount, onUnmounted } from 'vue'
import FormInput from './FormInput.vue'
import SongPicker from './SongPicker.vue'
import type { Track } from '../composables/useSongSearch'

const MAX_SONGS = 3
const COOLDOWN_MS = 5000
let nextSlotId = 1

interface Slot {
  id: number
  track: Track | null
}

const slots = ref<Slot[]>([{ id: nextSlotId++, track: null }])

const form = reactive({
  dedication: '',
  author: ''
})

const honeypot = ref('')
const isSubmitting = ref(false)
const isCoolingDown = ref(false)
const message = ref('')
const sendError = ref(false)

let cooldownTimer: ReturnType<typeof setTimeout> | null = null

const pickerRefs = ref<Array<InstanceType<typeof SongPicker> | null>>([])

const audioEl: HTMLAudioElement | null =
  typeof Audio !== 'undefined' ? new Audio() : null
const playingIndex = ref<number | null>(null)

audioEl?.addEventListener('ended', () => {
  playingIndex.value = null
})

const hasAnySong = computed(() => slots.value.some(s => s.track !== null))
const canAddMore = computed(() => {
  if (slots.value.length >= MAX_SONGS) return false
  const last = slots.value[slots.value.length - 1]
  return last?.track !== null
})
const canSubmit = computed(
  () => !isSubmitting.value && !isCoolingDown.value && hasAnySong.value
)
const submitLabel = computed(() => {
  if (isSubmitting.value) return 'Enviando...'
  if (isCoolingDown.value) return 'Espera unos segundos'
  return 'Enviar'
})

function startCooldown() {
  isCoolingDown.value = true
  if (cooldownTimer) clearTimeout(cooldownTimer)
  cooldownTimer = setTimeout(() => {
    isCoolingDown.value = false
  }, COOLDOWN_MS)
}

function addSlot() {
  if (!canAddMore.value) return
  slots.value.push({ id: nextSlotId++, track: null })
  nextTick(() => {
    pickerRefs.value[slots.value.length - 1]?.focus()
  })
}

function removeSlot(id: number) {
  const idx = slots.value.findIndex(s => s.id === id)
  if (idx < 0) return
  if (playingIndex.value === idx) stopAudio()
  else if (playingIndex.value !== null && playingIndex.value > idx) {
    playingIndex.value -= 1
  }
  slots.value.splice(idx, 1)
  if (slots.value.length === 0) {
    slots.value.push({ id: nextSlotId++, track: null })
  }
}

function togglePlay(index: number, track: Track) {
  if (!audioEl || !track.previewUrl) return
  if (playingIndex.value === index) {
    stopAudio()
    return
  }
  stopAudio()
  audioEl.src = track.previewUrl
  audioEl.currentTime = 0
  audioEl.play().then(() => {
    playingIndex.value = index
  }).catch(() => {
    playingIndex.value = null
  })
}

function stopAudio() {
  if (audioEl) {
    audioEl.pause()
    audioEl.currentTime = 0
  }
  playingIndex.value = null
}

async function submitForm() {
  if (!canSubmit.value) return

  if (honeypot.value.trim().length > 0) {
    message.value = '¡Gracias! Tus canciones han sido enviadas.'
    sendError.value = false
    return
  }

  const filled = slots.value.filter(s => s.track !== null)
  if (filled.length === 0) {
    message.value = 'Por favor, selecciona al menos una canción.'
    sendError.value = true
    return
  }

  stopAudio()
  isSubmitting.value = true
  startCooldown()
  message.value = ''
  sendError.value = false

  try {
    const response = await fetch('/api/song', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dedication: form.dedication.trim(),
        author: form.author.trim(),
        songs: filled.map(s => ({
          trackId: s.track!.id,
          name: s.track!.name.trim(),
          artist: s.track!.artist.trim(),
          album: (s.track!.album ?? '').trim()
        }))
      })
    })

    if (response.status === 207) {
      message.value = `Algunas canciones no pudieron enviarse. Inténtalo de nuevo si falta alguna.`
      sendError.value = true
      return
    }
    if (!response.ok) {
      if (response.status === 429) {
        message.value = 'Has enviado demasiadas solicitudes. Espera un momento.'
      } else {
        message.value = 'Por favor, contacta con los novios para solicitar tus canciones.'
      }
      sendError.value = true
      return
    }

    message.value = filled.length === 1
      ? '¡Gracias! Tu canción ha sido solicitada.'
      : `¡Gracias! Tus ${filled.length} canciones han sido solicitadas.`
    sendError.value = false
    resetForm()
  } catch (e) {
    message.value = 'Por favor, contacta con los novios para solicitar tus canciones.'
    sendError.value = true
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  slots.value = [{ id: nextSlotId++, track: null }]
  form.dedication = ''
  form.author = ''
  stopAudio()
}

onBeforeUnmount(() => {
  if (cooldownTimer) clearTimeout(cooldownTimer)
})

onUnmounted(() => {
  stopAudio()
  if (audioEl) audioEl.src = ''
})
</script>

<style scoped>
.songs {
  background-color: var(--color-background);
}

.form {
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: var(--color-white);
  padding: 24px;
  border-radius: 16px;
  position: relative;
}

.honeypot {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.slots {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.btn-add {
  background: transparent;
  border: 1px dashed var(--color-border);
  color: var(--color-primary);
  padding: 12px 16px;
  border-radius: 10px;
  font-size: var(--font-size-small);
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease;
}

.btn-add:hover {
  border-color: var(--color-primary);
  background-color: rgba(94, 146, 134, 0.06);
}

.btn-add-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: end;
  justify-content: center;
  border: 1px solid var(--color-primary);
  border-radius: 50%;
  font-size: 1.5rem;
  line-height: 1;
}

.btn-add-count {
  margin-left: auto;
  font-size: var(--font-size-x-small);
  color: var(--color-text-muted);
  font-weight: 400;
  letter-spacing: 0.05em;
}

.hint {
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--font-size-small);
  margin: 0;
  padding: 0 8px;
}

.btn-submit {
  padding: 14px 28px;
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-submit:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-message {
  text-align: center;
  padding: 14px;
  border-radius: 8px;
}

.form-message.success {
  background-color: #d4edda;
  color: #155724;
}

.form-message.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>
