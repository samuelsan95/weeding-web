---
name: core-new-apis
description: Vue 3.5+ reactivity system, lifecycle hooks, and composable patterns
---

# Reactivity, Lifecycle & Composables

## Reactivity

### ref vs shallowRef

```ts
import { ref, shallowRef } from 'vue'

// ref - deep reactivity (tracks nested changes)
const user = ref({ name: 'John', profile: { age: 30 } })
user.value.profile.age = 31  // Triggers reactivity

// shallowRef - only .value assignment triggers reactivity (better performance)
const data = shallowRef({ items: [] })
data.value.items.push('new')  // Does NOT trigger reactivity
data.value = { items: ['new'] }  // Triggers reactivity
```

**Prefer `shallowRef`** for large data structures or when deep reactivity is unnecessary.

### toValue (Vue 3.3+)

Normalize refs, getters, or plain values to actual values.

```ts
import { toValue } from 'vue'

const count = ref(1)
const getter = () => 2

toValue(count)     // 1
toValue(getter)    // 2
toValue(3)         // 3
```

Use this in composables to accept `MaybeRefOrGetter<T>` inputs.

### computed

```ts
import { ref, computed } from 'vue'

const count = ref(0)

// Read-only computed
const doubled = computed(() => count.value * 2)

// Writable computed
const plusOne = computed({
  get: () => count.value + 1,
  set: (val) => { count.value = val - 1 }
})
```

### reactive & readonly

```ts
import { reactive, readonly } from 'vue'

const state = reactive({ count: 0, nested: { value: 1 } })
state.count++  // Reactive

const readonlyState = readonly(state)
readonlyState.count++  // Warning, mutation blocked
```

Note: `reactive()` loses reactivity on destructuring. Use `ref()` or `toRefs()`.

### shallowReactive

```ts
import { shallowReactive } from 'vue'

const state = shallowReactive({
  count: 0,
  user: { name: 'Alice', age: 30 }
})

state.count++ // ✅ reactive
state.user.age = 31 // ❌ not reactive
```

## Watchers

### watch

```ts
import { ref, watch } from 'vue'

const count = ref(0)

// Watch single ref
watch(count, (newVal, oldVal) => {
  console.log(`Changed from ${oldVal} to ${newVal}`)
})

// Watch getter
watch(
  () => props.id,
  (id) => fetchData(id),
  { immediate: true }
)

// Watch multiple sources
watch([firstName, lastName], ([first, last]) => {
  fullName.value = `${first} ${last}`
})

// Deep watch with depth limit (Vue 3.5+)
watch(state, callback, { deep: 2 })

// Once (Vue 3.4+)
watch(source, callback, { once: true })
```

### watchEffect

Runs immediately and auto-tracks dependencies.

```ts
import { ref, watchEffect, onWatcherCleanup } from 'vue'

const id = ref(1)

watchEffect(async (onCleanup) => {
  const controller = new AbortController()

  // Cleanup on re-run or unmount (Vue 3.5+)
  onCleanup(() => controller.abort())

  const res = await fetch(`/api/${id.value}`, { signal: controller.signal })
  data.value = await res.json()
})

// Pause/resume/stop (Vue 3.5+)
const { pause, resume, stop } = watchEffect(() => {})
pause()
resume()
stop()
```

Note: In Vue 3.5+, `onCleanup` is passed as a function to the callback, not imported separately.

### onWatcherCleanup (Vue 3.5+)

Register cleanup callback for watchEffect.

```ts
import { watchEffect } from 'vue'

watchEffect((onCleanup) => {
  const timer = setTimeout(() => {}, 1000)
  onCleanup(() => clearTimeout(timer))
})
```

### Flush Timing

```ts
// 'pre' (default) - before component update
// 'post' - after component update (access updated DOM)
// 'sync' - immediate, use with caution

watch(source, callback, { flush: 'post' })
watchPostEffect(() => {})  // Alias for flush: 'post'
```

## Lifecycle Hooks

```ts
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onErrorCaptured,
  onActivated,      // KeepAlive
  onDeactivated,    // KeepAlive
  onServerPrefetch  // SSR only
} from 'vue'

onMounted(() => {
  console.log('DOM is ready')
})

onUnmounted(() => {
  // Cleanup timers, listeners, etc.
})

// Error boundary
onErrorCaptured((err, instance, info) => {
  console.error(err)
  return false  // Stop propagation
})
```

## Effect Scope

Group reactive effects for batch disposal.

```ts
import { effectScope, onScopeDispose } from 'vue'

const scope = effectScope()

scope.run(() => {
  const count = ref(0)
  const doubled = computed(() => count.value * 2)

  watch(count, () => console.log(count.value))

  // Cleanup when scope stops
  onScopeDispose(() => {
    console.log('Scope disposed')
  })
})

// Dispose all effects
scope.stop()

// Pause/resume all effects in scope (Vue 3.5+)
scope.pause()
scope.resume()
```

## useTemplateRef (Vue 3.5+)

Access template refs with type safety.

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'

const inputRef = useTemplateRef<HTMLInputElement>('input')

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <input ref="input" />
</template>
```

---

**Source:** https://vuejs.org/api/reactivity-core.html
-->
