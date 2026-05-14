<template>
  <section id="songs" class="section songs">
    <h2 class="section-title">Pide tu canción</h2>
    <form class="form" @submit.prevent="submitForm">
      <div class="form-group">
        <label for="song">Canción que quieres escuchar</label>
        <input type="text" id="song" v-model="form.song" required />
      </div>

      <div class="form-group">
        <label for="dedication">Dedicatoria para los novios</label>
        <textarea id="dedication" v-model="form.dedication" rows="3" required></textarea>
      </div>

      <div class="form-group">
        <label for="author">¿Quién lo escribe?</label>
        <input type="text" id="author" v-model="form.author" required />
      </div>

      <button type="submit" class="btn-submit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Enviando...' : 'Enviar' }}
      </button>

      <p v-if="message" class="form-message" :class="{ success: !error, error: error }">
        {{ message }}
      </p>
    </form>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'

const form = reactive({
  song: '',
  dedication: '',
  author: ''
})

const isSubmitting = ref(false)
const message = ref('')
const error = ref(false)

const submitForm = async () => {
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

const resetForm = () => {
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
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 500;
}

.form-group input[type="text"],
.form-group textarea {
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background-color: var(--color-white);
}

.btn-submit {
  padding: 15px 30px;
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-message {
  text-align: center;
  padding: 15px;
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