<script setup lang="ts">
const { t } = useI18n()

interface Props {
  show: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel'
})

const emit = defineEmits<{
  'confirm': []
  'cancel': []
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}

// Close on escape key
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.show) {
    handleCancel()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="handleCancel"
        />

        <!-- Modal -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="show"
            class="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <!-- Icon -->
            <div class="flex justify-center mb-4">
              <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-primary" />
              </div>
            </div>

            <!-- Title -->
            <h3 class="text-xl font-display font-semibold text-gray-900 text-center mb-2">
              {{ title }}
            </h3>

            <!-- Message -->
            <p class="text-gray-600 text-center mb-6">
              {{ message }}
            </p>

            <!-- Actions -->
            <div class="flex gap-3">
              <Button
                variant="outline"
                size="md"
                class="flex-1"
                @click="handleCancel"
              >
                {{ cancelText }}
              </Button>
              <Button
                variant="primary"
                size="md"
                class="flex-1"
                @click="handleConfirm"
              >
                {{ confirmText }}
              </Button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
