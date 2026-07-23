<template>
  <section id="confirmation" class="section section--card confirmation">
    <span class="section-eyebrow">¿Vendrás?</span>
    <h2 class="section-title">Confirmar Asistencia</h2>
    <div class="section-divider"></div>
    <form class="form" @submit.prevent="submitForm" novalidate>
      <FormInput
        v-model="form.name"
        label="Tú nombre completo *"
        required
        autocomplete="name"
        hint="Introduce tu nombre completo"
      />

      <fieldset class="form-group">
        <legend class="form-legend">¿Asistirás? *</legend>
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

      <FormInput
        v-if="form.attending === 'Sí'"
        v-model="form.adults"
        type="number"
        label="Adultos"
        placeholder="0"
        :min="0"
        hint="Número de adultos"
      />

      <FormInput
        v-if="form.attending === 'Sí'"
        v-model="form.children"
        type="number"
        label="Niños"
        placeholder="0"
        :min="0"
        hint="Número de niños"
      />

      <FormInput
        v-if="form.attending === 'Sí'"
        v-model="form.allergies"
        type="textarea"
        label="Alergias o intolerancias"
        placeholder="Indica si tienes alguna alergia o intolerancia"
        hint="Describe cualquier alergia o intolerancia alimentaria"
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
  name: '',
  attending: '',
  adults: '0',
  children: '0',
  allergies: ''
})

const isSubmitting = ref(false)
const message = ref('')
const error = ref(false)

const submitForm = async () => {
  if (!form.name.trim()) {
    message.value = 'Por favor, introduce tu nombre.'
    error.value = true
    return
  }
  if (!form.attending) {
    message.value = 'Por favor, indica si asistirás.'
    error.value = true
    return
  }

  isSubmitting.value = true
  message.value = ''

  try {
    const timestamp = new Date().toISOString()
    const data = {
      Timestamp: timestamp,
      'Nombre y apellidos': form.name,
      'Asistira': form.attending,
      'Adultos': form.attending === 'Sí' ? form.adults : 'N/A',
      'Niños': form.attending === 'Sí' ? form.children : 'N/A',
      'Alergias/Intolerancias': form.attending === 'Sí' ? form.allergies : 'N/A'
    }

    const response = await fetch(import.meta.env.VITE_CONFIRMATION_SHEET_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': import.meta.env.VITE_CONFIRMATION_API_KEY
      },
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
  form.adults = '0'
  form.children = '0'
  form.allergies = ''
}
</script>

<style scoped>
.confirmation {
  background-color: var(--color-background);
}

.form {
  background-color: var(--color-white);
  max-width: 500px;
  padding: 24px;
  border-radius: 16px;
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
  font-size: var(--font-size-medium);
  color: var(--color-primary);
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