<template>
  <section id="songs" class="section section--flush songs">
    <span class="section-eyebrow">Bailemos</span>
    <h2 class="section-title">Pide tu canción</h2>
    <div class="section-divider"></div>
    <form class="form" @submit.prevent="submitForm" novalidate>
      <FormInput
        v-model="form.song"
        label="Canción que quieres escuchar *"
        required
        hint="Escribe el título de la canción y el artista"
      />

      <FormInput
        v-model="form.dedication"
        type="textarea"
        label="Dedicatoria para los novios"
        hint="Escribe una dedicatoria especial para los novios (opcional)"
      />

      <FormInput
        v-model="form.author"
        label="¿Quién lo escribe?"
        autocomplete="name"
        hint="Déjalo vacío si quieres que sea anónimo"
      />

      <button type="submit" class="btn-submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Enviando...' : 'Enviar' }}
      </button>

      <p
        v-if="message"
        class="form-message"
        :class="{ success: !error, error: error }"
        role="alert"
        aria-live="assertive"
      >
        {{ message }}
      </p>
    </form>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import FormInput from './FormInput.vue'

const form = reactive({
  song: '',
  dedication: '',
  author: ''
})

const isSubmitting = ref(false)
const message = ref('')
const error = ref(false)

async function submitForm() {
  if (!form.song.trim()) {
    message.value = 'Por favor, indica la canción que quieres solicitar.'
    error.value = true
    return
  }

  isSubmitting.value = true
  message.value = ''

  try {
    const timestamp = new Date().toISOString()
    const data = {
      Timestamp: timestamp,
      'Cancion': form.song,
      'Dedicatoria': form.dedication,
      'Quien': form.author
    }

    const response = await fetch(import.meta.env.VITE_SONG_SHEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': import.meta.env.VITE_SONG_API_KEY
      },
      body: JSON.stringify(data)
    })

    if (response.ok) {
      message.value = '¡Gracias! Tu canción ha sido solicitada.'
      error.value = false
      resetForm()
    } else {
      throw new Error('Error al enviar')
    }
  } catch (e) {
    message.value = 'Por favor, contacta con los novios para solicitar tu canción.'
    error.value = true
  } finally {
    isSubmitting.value = false
  }
}

function resetForm() {
  form.song = ''
  form.dedication = ''
  form.author = ''
}
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