<template>
  <section id="confirmation" class="section section--card confirmation">
    <span class="section-eyebrow">¿Vendrás?</span>
    <h2 class="section-title">Confirmar Asistencia</h2>
    <div class="section-divider"></div>

    <div v-if="alreadySubmitted" class="already-sent">
      <p>Ya has enviado tu confirmación desde este navegador. Si necesitas modificarla, contacta con los novios.</p>
      <button type="button" class="btn-allow-again" @click="allowResubmit">
        Volver a permitir
      </button>
    </div>

    <form v-else class="form" @submit.prevent="submitForm" novalidate>
      <input
        type="text"
        name="company"
        tabindex="-1"
        autocomplete="off"
        aria-hidden="true"
        class="honeypot"
        v-model="honeypot"
      />

      <FormInput
        v-model="form.name"
        label="Tú nombre completo *"
        required
        autocomplete="name"
        :maxlength="100"
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
        :max="20"
        :step="1"
        hint="Número de adultos"
      />

      <FormInput
        v-if="form.attending === 'Sí'"
        v-model="form.children"
        type="number"
        label="Niños"
        placeholder="0"
        :min="0"
        :max="20"
        :step="1"
        hint="Número de niños"
      />

      <FormInput
        v-if="form.attending === 'Sí'"
        v-model="form.allergies"
        type="textarea"
        label="Alergias o intolerancias"
        placeholder="Indica si tienes alguna alergia o intolerancia"
        :maxlength="500"
        hint="Describe cualquier alergia o intolerancia alimentaria"
      />

      <button type="submit" class="btn-submit" :disabled="!canSubmit">
        {{ submitLabel }}
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
import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import FormInput from './FormInput.vue'

const STORAGE_KEY = 'wedding-confirmation-submitted'
const COOLDOWN_MS = 5000

const form = reactive({
  name: '',
  attending: '',
  adults: '0',
  children: '0',
  allergies: ''
})

const honeypot = ref('')
const isSubmitting = ref(false)
const isCoolingDown = ref(false)
const message = ref('')
const error = ref(false)
const alreadySubmitted = ref(false)

let cooldownTimer: ReturnType<typeof setTimeout> | null = null

if (typeof window !== 'undefined' && window.localStorage) {
  alreadySubmitted.value = window.localStorage.getItem(STORAGE_KEY) === '1'
}

const canSubmit = computed(
  () =>
    !isSubmitting.value &&
    !isCoolingDown.value &&
    form.name.trim().length > 0 &&
    form.attending.length > 0
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

function allowResubmit() {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(STORAGE_KEY)
  }
  alreadySubmitted.value = false
  message.value = ''
  error.value = false
}

const submitForm = async () => {
  if (!canSubmit.value) return

  if (honeypot.value.trim().length > 0) {
    message.value = '¡Gracias! Tu confirmación ha sido enviada.'
    error.value = false
    return
  }

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

  const adults = form.attending === 'Sí' ? parseInt(form.adults, 10) || 0 : 0
  const children = form.attending === 'Sí' ? parseInt(form.children, 10) || 0 : 0
  if (form.attending === 'Sí' && (adults < 0 || adults > 20 || children < 0 || children > 20)) {
    message.value = 'Por favor, revisa el número de adultos y niños.'
    error.value = true
    return
  }

  isSubmitting.value = true
  startCooldown()
  message.value = ''
  error.value = false

  try {
    const response = await fetch('/api/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        attending: form.attending,
        adults,
        children,
        allergies: form.attending === 'Sí' ? form.allergies.trim() : ''
      })
    })

    if (!response.ok) {
      if (response.status === 429) {
        message.value = 'Has enviado demasiadas solicitudes. Espera un momento.'
      } else {
        message.value = 'Por favor, contacta con los novios para confirmar tu asistencia.'
      }
      error.value = true
      return
    }

    message.value = '¡Gracias! Tu confirmación ha sido enviada.'
    error.value = false
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEY, '1')
    }
    alreadySubmitted.value = true
    resetForm()
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

onBeforeUnmount(() => {
  if (cooldownTimer) clearTimeout(cooldownTimer)
})
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

.honeypot {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
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

.already-sent {
  background-color: var(--color-white);
  max-width: 500px;
  padding: 24px;
  border-radius: 16px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.already-sent p {
  color: var(--color-text);
  font-size: var(--font-size-small);
  line-height: 1.5;
}

.btn-allow-again {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-primary);
  padding: 8px 18px;
  border-radius: 20px;
  font-family: inherit;
  font-size: var(--font-size-x-small);
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.btn-allow-again:hover {
  border-color: var(--color-primary);
  background-color: rgba(94, 146, 134, 0.06);
}

.btn-allow-again:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
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
