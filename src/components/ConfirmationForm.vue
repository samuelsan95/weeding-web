<template>
  <section id="confirmation" class="section confirmation">
    <h2 class="section-title">Confirmar Asistencia</h2>
    <form class="form" @submit.prevent="submitForm" novalidate>
      <div class="form-group">
        <label for="conf-name">Nombre y apellidos</label>
        <input
          type="text"
          id="conf-name"
          v-model="form.name"
          required
          autocomplete="name"
          aria-describedby="conf-name-hint"
        />
        <span id="conf-name-hint" class="visually-hidden">Introduce tu nombre completo</span>
      </div>

      <fieldset class="form-group">
        <legend class="form-legend">¿Asistirás?</legend>
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
      </fieldset>

      <fieldset class="form-group" v-if="form.attending === 'Sí'" :aria-live="'polite'">
        <legend class="form-legend">Número de acompañantes</legend>
        <select id="conf-guests" v-model="form.guests" aria-label="Número de acompañantes">
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </fieldset>

      <fieldset class="form-group" v-if="form.attending === 'Sí'">
        <legend class="form-legend">¿Habrá niños?</legend>
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
      </fieldset>

      <div class="form-group" v-if="form.attending === 'Sí'">
        <label for="conf-allergies">Alergias o intolerancias</label>
        <textarea
          id="conf-allergies"
          v-model="form.allergies"
          rows="3"
          placeholder="Indica si tienes alguna alergia o intolerancia"
          aria-describedby="conf-allergies-hint"
        ></textarea>
        <span id="conf-allergies-hint" class="visually-hidden">
          Describe cualquier alergia o intolerancia alimentaria
        </span>
      </div>

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

function resetForm() {
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
  border: none;
  padding: 0;
  margin: 0;
}

.form-legend {
  font-size: 0.9rem;
  color: var(--color-text);
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.form-group label:not(.radio-label) {
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
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input[type="text"]:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(94, 146, 134, 0.15);
}

.radio-group {
  display: flex;
  gap: 24px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  width: 20px;
  height: 20px;
  accent-color: var(--color-primary);
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