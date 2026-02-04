<script setup lang="ts">
defineProps<{
  name: string
  avatar?: string | null
  size?: 'sm' | 'md' | 'lg'
  namePosition?: 'right' | 'bottom' | 'hidden'
}>()

const sizeClasses = {
  sm: {
    container: 'gap-2',
    avatar: 'w-6 h-6',
    icon: 'w-4 h-4',
    text: 'text-sm'
  },
  md: {
    container: 'gap-3',
    avatar: 'w-10 h-10',
    icon: 'w-6 h-6',
    text: 'text-base'
  },
  lg: {
    container: 'gap-2',
    avatar: 'w-20 h-20 border-[3px]',
    icon: 'w-10 h-10',
    text: 'text-sm'
  }
}
</script>

<template>
  <div
    class="flex items-center"
    :class="[
      sizeClasses[size || 'sm'].container,
      namePosition === 'bottom' ? 'flex-col' : 'flex-row'
    ]"
  >
    <!-- Avatar Image or Fallback Icon -->
    <img
      v-if="avatar"
      :src="avatar"
      :alt="name"
      class="rounded-full object-cover border-primary-200 hover:border-primary-300 hover:scale-105 transition-all duration-200"
      :class="[
        sizeClasses[size || 'sm'].avatar,
        size === 'lg' ? 'border-primary-100' : 'border'
      ]"
    />
    <div
      v-else
      class="rounded-full bg-primary-50 flex items-center justify-center border border-primary-200"
      :class="sizeClasses[size || 'sm'].avatar"
    >
      <Icon
        name="heroicons:user"
        class="text-primary-400"
        :class="sizeClasses[size || 'sm'].icon"
      />
    </div>

    <!-- Author Name -->
    <span
      v-if="namePosition !== 'hidden'"
      class="font-display font-medium text-primary"
      :class="[
        sizeClasses[size || 'sm'].text,
        namePosition === 'bottom' ? 'text-primary-500' : ''
      ]"
    >
      {{ name }}
    </span>
  </div>
</template>
