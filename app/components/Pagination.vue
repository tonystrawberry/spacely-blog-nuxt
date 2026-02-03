<script setup lang="ts">
const { t } = useI18n()

interface Props {
  currentPage: number
  totalPages: number
  basePath?: string
}

const props = withDefaults(defineProps<Props>(), {
  basePath: '/articles'
})

const emit = defineEmits<{
  'update:page': [page: number]
}>()

const pages = computed(() => {
  const total = props.totalPages
  const current = props.currentPage
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i)
    }
  }

  let l: number | null = null
  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:page', page)
  }
}

const previousPage = computed(() => props.currentPage > 1 ? props.currentPage - 1 : null)
const nextPage = computed(() => props.currentPage < props.totalPages ? props.currentPage + 1 : null)
</script>

<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-4 mt-12">
    <!-- Previous Button -->
    <Button
      variant="outline"
      :disabled="!previousPage"
      @click="previousPage && goToPage(previousPage)"
    >
      <Icon name="heroicons:chevron-left" class="w-4 h-4 inline mr-1" />
      {{ t('pagination.previous') }}
    </Button>

    <!-- Page Numbers -->
    <div class="flex items-center gap-3">
      <button
        v-for="(page, index) in pages"
        :key="index"
        @click="typeof page === 'number' && goToPage(page)"
        class="min-w-[44px] h-11 px-4 rounded-lg font-display text-base font-medium transition-all duration-200"
        :class="
          typeof page === 'number' && page === currentPage
            ? 'bg-primary text-white hover:bg-primary-500 shadow-md'
            : typeof page === 'number'
            ? 'bg-transparent text-primary hover:text-primary-500'
            : 'bg-transparent text-gray-400 cursor-default pointer-events-none'
        "
        :disabled="typeof page !== 'number'"
      >
        {{ page }}
      </button>
    </div>

    <!-- Next Button -->
    <Button
      variant="outline"
      :disabled="!nextPage"
      @click="nextPage && goToPage(nextPage)"
    >
      {{ t('pagination.next') }}
      <Icon name="heroicons:chevron-right" class="w-4 h-4 inline ml-1" />
    </Button>
  </nav>
</template>
