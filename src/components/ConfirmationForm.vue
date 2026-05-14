<template>
  <section id="confirmation" class="section confirmation">
    <h2 class="section-title">Confirmar Asistencia</h2>
    <form class="form" @submit.prevent="submitForm">
      <div class="form-group">
        <label for="name">Nombre y apellidos</label>
        <input type="text" id="name" v-model="form.name" required />
      </div>

      <div class="form-group">
        <label>¿Asistirás?</label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" v-model="form.attending" value="Sí" required />
            <span>Sí</span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="form.attending" value="No" />
            <span>No</span>
          </label>
        </div>
      </div>

      <div class="form-group" v-if="form.attending === 'Sí'">
        <label for="guests">Número de acompañantes</label>
        <select id="guests" v-model="form.guests">
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </div>

      <div class="form-group" v-if="form.attending === 'Sí'">
        <label>¿Habrá niños?</label>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" v-model="form.children" value="Sí" />
            <span>Sí</span>
          </label>
          <label class="radio-label">
            <input type="radio" v-model="form.children" value="No" />
            <span>No</span>
          </label>
        </div>
      </div>

      <div class="form-group" v-if="form.attending === 'Sí'">
        <label for="allergies">Alergias o intolerancias</label>
        <textarea id="allergies" v-model="form.allergies" rows="3" placeholder="Indica si tienes alguna alergia o intolerancia"></textarea>
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
  name: '',
  attending: '',
  guests: '0',
  children: '',
  allergies: ''
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
      'Nombre y apellidos': form.name,
      'Asistirá': form.attending,
      'Acompañantes': form.attending === 'Sí' ? form.guests : 'N/A',
      'Niños': form.attending === 'Sí' ? form.children : 'N/A',
      'Alergias/Intolerancias': form.attending === 'Sí' ? form.allergies : 'N/A'
    }

    const response = await fetch('https://sheet.best/api/sheets/YOUR_SHEET_ID_HERE', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })

    if (response.ok) {
      message.value = '¡Gracias! Tu confirmación ha sido enviada.'
      error.value = false
      resetForm()
    } else {
      throw new Error('Error al enviar')
    }
  } catch (e) {
    message.value = 'Por favor, contacta con los novios para confirmar tu asistencia.'
    error.value = true
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.name = ''
  form.attending = ''
  form.guests = '0'
  form.children = ''
  form.allergies = ''
}
</script>

<style scoped>
.confirmation {
  background-color: var(--color-white);
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
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background-color: var(--color-white);
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
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