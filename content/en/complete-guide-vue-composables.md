---
title: The Complete Guide to Vue 3 Composables
description: Master the art of building reusable logic with Vue 3 Composition API and composables. Learn patterns, best practices, and real-world examples.
date: 2024-08-15
author: '@nazar-pc'
image: /images/articles/featured.svg
category: Vue
tags: [vue, composables, composition-api, typescript, reusability]
---

# The Complete Guide to Vue 3 Composables

Master the art of building reusable logic with Vue 3 Composition API and composables. Learn patterns, best practices, and real-world examples.

## What are Composables?

Composables are **functions that leverage Vue's Composition API** to encapsulate and reuse stateful logic. They're one of the most powerful features introduced in Vue 3, allowing developers to extract and share logic between components without the limitations of mixins or higher-order components.

> "Composables are to the Composition API what mixins were to the Options API, but *better* in almost every way." — Evan You, Creator of Vue.js

The key benefits of composables include:

- **Reusability**: Write once, use everywhere
- **Type Safety**: Full TypeScript support out of the box
- **Testability**: Easy to unit test in isolation
- **Flexibility**: Compose multiple composables together

## Your First Composable

Let's start with a simple example — a `useMouse` composable that tracks the mouse position:

```typescript
// composables/useMouse.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(event: MouseEvent) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

Using it in a component is straightforward:

```vue
<script setup>
import { useMouse } from '@/composables/useMouse'

const { x, y } = useMouse()
</script>

<template>
  <p>Mouse position: {{ x }}, {{ y }}</p>
</template>
```

## Naming Conventions

Following consistent naming conventions is crucial for maintainability. Here are the **recommended practices**:

| Convention | Example | Description |
|------------|---------|-------------|
| Prefix with `use` | `useAuth`, `useFetch` | Standard convention for composables |
| Camel case | `useLocalStorage` | JavaScript naming standard |
| Descriptive names | `useUserPermissions` | Clear intent and purpose |

## Advanced Patterns

### 1. Accepting Reactive Arguments

Composables can accept both regular values and reactive references using `toValue()`:

```typescript
import { toValue, watchEffect } from 'vue'
import type { MaybeRefOrGetter } from 'vue'

export function useFetch(url: MaybeRefOrGetter<string>) {
  const data = ref(null)
  const error = ref(null)

  watchEffect(async () => {
    // toValue() unwraps refs or calls getters
    const response = await fetch(toValue(url))
    data.value = await response.json()
  })

  return { data, error }
}
```

### 2. Returning Multiple Values

Always return an **object** instead of an array for better developer experience:

```typescript
// ✅ Good - destructure what you need
const { data, error, isLoading } = useFetch('/api/users')

// ❌ Avoid - position-dependent
const [data, error, isLoading] = useFetch('/api/users')
```

### 3. Handling Async Operations

For async composables, consider providing loading and error states:

```typescript
export function useAsyncData<T>(asyncFn: () => Promise<T>) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  async function execute() {
    isLoading.value = true
    error.value = null

    try {
      data.value = await asyncFn()
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }

  return {
    data,
    error,
    isLoading,
    execute
  }
}
```

## Real-World Example: useLocalStorage

Here's a practical composable for persisting state to localStorage:

```typescript
import { ref, watch } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T) {
  // Read initial value from localStorage
  const storedValue = localStorage.getItem(key)
  const data = ref<T>(
    storedValue ? JSON.parse(storedValue) : defaultValue
  )

  // Watch for changes and sync to localStorage
  watch(
    data,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )

  // Method to clear the stored value
  function clear() {
    localStorage.removeItem(key)
    data.value = defaultValue
  }

  return { data, clear }
}
```

Usage example:

```vue
<script setup>
import { useLocalStorage } from '@/composables/useLocalStorage'

const { data: theme, clear } = useLocalStorage('theme', 'light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}
</script>
```

## Best Practices Checklist

When creating composables, follow these guidelines:

1. **Keep them focused** — Each composable should do one thing well
2. **Handle cleanup** — Use `onUnmounted` to clean up event listeners and subscriptions
3. **Provide sensible defaults** — Make composables work out of the box
4. **Document the API** — Use JSDoc comments for better IDE support
5. **Consider SSR** — Check for `window` or `document` before using them

### Common Mistakes to Avoid

Here are some pitfalls to watch out for:

- ❌ **Don't** destructure reactive objects (use `toRefs` instead)
- ❌ **Don't** forget to handle the unmount lifecycle
- ❌ **Don't** make composables too generic (YAGNI principle)
- ✅ **Do** use TypeScript for better type inference
- ✅ **Do** test your composables in isolation

## Composing Composables

One of the most powerful aspects is *composing* multiple composables together:

```typescript
export function useUserProfile(userId: MaybeRefOrGetter<string>) {
  // Compose multiple composables
  const { data: user, isLoading } = useFetch(
    () => `/api/users/${toValue(userId)}`
  )

  const { data: preferences } = useLocalStorage(
    `user-prefs-${toValue(userId)}`,
    { theme: 'light', notifications: true }
  )

  const fullName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : ''
  )

  return {
    user,
    preferences,
    fullName,
    isLoading
  }
}
```

## Useful Resources

To dive deeper into composables, check out these resources:

- [Vue.js Official Documentation](https://vuejs.org/guide/reusability/composables.html) — The definitive guide
- [VueUse](https://vueuse.org/) — Collection of 200+ ready-to-use composables
- [Anthony Fu's Blog](https://antfu.me/) — Advanced patterns and techniques

## Conclusion

Composables represent a **paradigm shift** in how we organize and share logic in Vue applications. By following the patterns and best practices outlined in this guide, you'll be able to:

- Write cleaner, more maintainable code
- Share logic across components effortlessly
- Build a library of reusable utilities for your projects

The Composition API and composables aren't just new syntax — they're a *better way* to think about component logic. Start small, experiment with simple composables, and gradually build up your toolkit.
