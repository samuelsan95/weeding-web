<template>
  <div class="form-group">
    <label :for="inputId">{{ label }}</label>
    <textarea
      v-if="type === 'textarea'"
      :id="inputId"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :aria-describedby="hintId"
      rows="3"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
    <input
      v-else
      :type="type"
      :id="inputId"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="autocomplete"
      :aria-describedby="hintId"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="hint" :id="hintId" class="visually-hidden">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  label: string
  type?: 'text' | 'textarea'
  placeholder?: string
  required?: boolean
  autocomplete?: string
  hint?: string
}>(), {
  type: 'text',
  placeholder: '',
  required: false,
  autocomplete: 'off'
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => `input-${props.label.toLowerCase().replace(/\s+/g, '-')}`)
const hintId = computed(() => `${inputId.value}-hint`)
</script>

<style scoped>
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

.form-group input,
.form-group textarea {
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  background-color: var(--color-white);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(94, 146, 134, 0.15);
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
</style>