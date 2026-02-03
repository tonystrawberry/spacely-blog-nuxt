<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  to?: string
  href?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})

const buttonClasses = computed(() => {
  const base = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-display',
    'font-medium',
    'transition-all',
    'duration-200',
    'rounded-lg'
  ]

  const variants = {
    primary: [
      'bg-primary',
      'text-white',
      'hover:bg-primary-500',
      'hover:-translate-y-0.5',
      'hover:shadow-lg',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed',
      'disabled:hover:translate-y-0'
    ],
    outline: [
      'bg-white',
      'text-primary',
      'border-2',
      'border-primary',
      'hover:bg-primary-50',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    ],
    ghost: [
      'bg-transparent',
      'text-primary',
      'hover:bg-primary-50',
      'disabled:opacity-50',
      'disabled:cursor-not-allowed'
    ]
  }

  const sizes = {
    sm: ['px-3', 'py-1.5', 'text-sm'],
    md: ['px-4', 'py-2', 'text-sm'],
    lg: ['px-6', 'py-3', 'text-base']
  }

  return [...base, ...variants[props.variant], ...sizes[props.size]].join(' ')
})
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <slot />
  </NuxtLink>
  <a
    v-else-if="href"
    :href="href"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <slot />
  </a>
  <button
    v-else
    :disabled="disabled"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>
