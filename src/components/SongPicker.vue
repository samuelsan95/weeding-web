<template>
  <div class="picker" :class="{ 'picker--has-selection': modelValue }">
    <div v-if="!modelValue" class="picker-search">
      <div class="picker-header">
        <label :for="inputId" class="picker-label">
          Canción {{ index + 1 }}<span v-if="required"> *</span>
        </label>
      </div>
      <div class="combobox-field">
        <input
          :id="inputId"
          ref="inputEl"
          v-model="query"
          type="text"
          class="combobox-input"
          placeholder="Busca por título o artista…"
          role="combobox"
          :aria-expanded="isOpen"
          :aria-controls="listId"
          :aria-activedescendant="activeId || undefined"
          autocomplete="off"
          @focus="onFocus"
          @keydown="onKeydown"
        />
        <button
          v-if="query"
          type="button"
          class="combobox-clear"
          aria-label="Borrar búsqueda"
          @click="clearQuery"
        >×</button>
      </div>
      <ul
        v-if="isOpen && query.length > 0"
        :id="listId"
        class="results"
        role="listbox"
      >
        <li v-if="isLoading" class="results-status">
          <span class="spinner" aria-hidden="true"></span>
          Buscando…
        </li>
        <li v-else-if="error" class="results-status results-status--error">
          {{ error }}
        </li>
        <li
          v-else-if="query.trim().length < MIN_QUERY_LENGTH"
          class="results-status"
        >
          Escribe al menos {{ MIN_QUERY_LENGTH }} letras para buscar.
        </li>
        <li
          v-else-if="results.length === 0"
          class="results-status"
        >
          Sin resultados para «{{ query }}». Prueba con otro título o artista.
        </li>
        <li
          v-for="(track, i) in results"
          :key="track.id"
          :id="`result-${track.id}`"
          class="result"
          :class="{ 'result--active': i === activeIndex }"
          role="option"
          :aria-selected="i === activeIndex"
          @mouseenter="activeIndex = i"
          @mousedown.prevent="select(track)"
        >
          <img
            :src="track.artwork"
            :alt="`Portada de ${track.album}`"
            class="result-art"
            loading="lazy"
          />
          <div class="result-meta">
            <span class="result-title">{{ track.name }}</span>
            <span class="result-sub">
              {{ track.artist }}<span v-if="track.album"> · {{ track.album }}</span>
            </span>
          </div>
          <span class="result-duration">{{ formatDuration(track.durationMs) }}</span>
        </li>
      </ul>
    </div>

    <div v-else class="selected" role="status" aria-live="polite">
      <img
        :src="modelValue.artwork"
        :alt="`Portada de ${modelValue.album}`"
        class="selected-art"
      />
      <div class="selected-meta">
        <span class="selected-eyebrow">Canción {{ index + 1 }}</span>
        <span class="selected-title">{{ modelValue.name }}</span>
        <span class="selected-sub">
          {{ modelValue.artist }}<span v-if="modelValue.album"> · {{ modelValue.album }}</span>
        </span>
      </div>
      <div class="selected-actions">
        <button
          v-if="modelValue.previewUrl"
          type="button"
          class="btn-play"
          :class="{ 'btn-play--playing': playing }"
          :aria-label="playing ? 'Pausar preview' : 'Reproducir preview'"
          :aria-pressed="playing"
          @click="onTogglePlay"
        >
          <span v-if="playing" aria-hidden="true">❚❚</span>
          <span v-else aria-hidden="true">▶</span>
        </button>
        <span
          v-else
          class="no-preview"
          title="Esta canción no tiene preview disponible"
        >Sin preview</span>
        <button
          v-if="removable"
          type="button"
          class="btn-remove"
          aria-label="Eliminar canción"
          @click="$emit('remove')"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useSongSearch, formatDuration, type Track } from '../composables/useSongSearch'

const props = withDefaults(defineProps<{
  modelValue: Track | null
  index: number
  playing: boolean
  removable: boolean
  required?: boolean
}>(), {
  required: true
})

const emit = defineEmits<{
  'update:modelValue': [track: Track | null]
  'togglePlay': [track: Track]
  'remove': []
}>()

const inputEl = ref<HTMLInputElement | null>(null)
const query = ref('')
const isOpen = ref(false)
const activeIndex = ref(-1)

const MIN_QUERY_LENGTH = 3

const { results, isLoading, error, runSearch, clear: clearResults } = useSongSearch(query, { minLength: MIN_QUERY_LENGTH })

const inputId = computed(() => `song-search-${props.index}`)
const listId = computed(() => `song-results-${props.index}`)
const activeId = computed(() =>
  activeIndex.value >= 0 && results.value[activeIndex.value]
    ? `result-${results.value[activeIndex.value].id}`
    : ''
)

function onFocus() {
  if (query.value.trim().length > 0) isOpen.value = true
}

function clearQuery() {
  query.value = ''
  clearResults()
  isOpen.value = false
  inputEl.value?.focus()
}

function select(track: Track) {
  emit('update:modelValue', track)
  query.value = ''
  isOpen.value = false
  activeIndex.value = -1
  clearResults()
}

function onTogglePlay() {
  if (props.modelValue) emit('togglePlay', props.modelValue)
}

function onKeydown(e: KeyboardEvent) {
  if (!isOpen.value && (e.key === 'ArrowDown' || e.key === 'Enter')) {
    isOpen.value = true
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, results.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, -1)
  } else if (e.key === 'Enter') {
    if (activeIndex.value >= 0 && results.value[activeIndex.value]) {
      e.preventDefault()
      select(results.value[activeIndex.value])
    } else if (
      query.value.trim().length >= MIN_QUERY_LENGTH &&
      !isLoading.value &&
      results.value.length === 0
    ) {
      e.preventDefault()
      runSearch(query.value.trim())
    }
  } else if (e.key === 'Escape') {
    isOpen.value = false
    activeIndex.value = -1
  }
}

function onDocumentMouseDown(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.picker')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMouseDown, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocumentMouseDown, true)
})

watch(query, (next) => {
  activeIndex.value = -1
  isOpen.value = next.trim().length > 0
})

defineExpose({
  focus: () => inputEl.value?.focus()
})
</script>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.picker-label {
  font-size: var(--font-size-medium);
  color: var(--color-primary);
  font-weight: 500;
}

.combobox-field {
  position: relative;
}

.combobox-input {
  width: 100%;
  padding: 12px 36px 12px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: var(--font-size-small);
  font-family: inherit;
  background-color: var(--color-white);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.combobox-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(94, 146, 134, 0.15);
}

.combobox-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.combobox-clear:hover {
  background-color: var(--color-border);
  color: var(--color-text);
}

.results {
  position: absolute;
  top: calc(100% - 4px);
  left: 0;
  right: 0;
  list-style: none;
  margin: 0;
  padding: 6px;
  background-color: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(74, 74, 74, 0.12);
  max-height: 340px;
  overflow-y: auto;
  z-index: 10;
}

.results-status {
  padding: 14px;
  color: var(--color-text-muted);
  font-size: var(--font-size-small);
  display: flex;
  align-items: center;
  gap: 10px;
}

.results-status--error {
  color: var(--color-error);
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.result {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.result--active,
.result:hover {
  background-color: var(--color-primary-light);
}

.result-art {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  background-color: var(--color-border);
  flex-shrink: 0;
}

.result-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.result-title {
  font-size: var(--font-size-small);
  color: var(--color-text);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-sub {
  font-size: var(--font-size-x-small);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-duration {
  font-size: var(--font-size-x-small);
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.selected {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background-color: var(--color-primary-light);
  border-radius: 12px;
}

.selected-art {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  background-color: var(--color-border);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(74, 74, 74, 0.15);
}

.selected-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.selected-eyebrow {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--color-primary);
  font-weight: 600;
}

.selected-title {
  font-size: var(--font-size-small);
  color: var(--color-text);
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-sub {
  font-size: var(--font-size-x-small);
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-play {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background-color: var(--color-primary);
  color: var(--color-white);
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.btn-play:hover {
  transform: scale(1.05);
}

.btn-play--playing {
  background-color: var(--color-secondary);
}

.btn-remove {
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 1.2rem;
  line-height: 1;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.no-preview {
  font-size: var(--font-size-x-small);
  color: var(--color-text-muted);
  padding: 0 8px;
  white-space: nowrap;
  letter-spacing: 0.05em;
}

.btn-remove:hover {
  background-color: var(--color-white);
  color: var(--color-error);
  border-color: var(--color-error);
}
</style>
