<template>
  <section id="songs" class="section songs">
    <h2 class="section-title">Pide tu canción</h2>
    <form class="form" @submit.prevent="submitForm" novalidate>
      <FormInput
        v-model="form.song"
        label="Canción que quieres escuchar"
        required
        hint="Escribe el título de la canción y el artista"
      />

      <FormInput
        v-model="form.dedication"
        type="textarea"
        label="Dedicatoria para los novios"
        required
        hint="Escribe una dedicatoria especial para los novios"
      />

      <FormInput
        v-model="form.author"
        label="¿Quién lo escribe?"
        required
        autocomplete="name"
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
  isSubmitting.value = true
  message.value = ''

  try {
    const timestamp = new Date().toISOString()
    const data = {
      Timestamp: timestamp,
      'Canción': form.song,
      'Dedicatoria': form.dedication,
      'Autor': form.author
    }

    const response = await fetch('https://sheet.best/api/sheets/YOUR_SHEET_ID_HERE', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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