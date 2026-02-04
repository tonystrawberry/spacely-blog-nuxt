<script setup lang="ts">
const { t, locale } = useI18n()

interface Props {
  articles: Array<{ date?: string; [key: string]: any }>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'date-selected': [date: string | null]
}>()

// Current selected year - defaults to most recent year with articles
const currentYear = ref(new Date().getFullYear())

// Initialize to the most recent year that has articles
watch(() => props.articles, (articles) => {
  if (articles.length > 0) {
    const yearsWithArticles = articles
      .filter(a => a.date)
      .map(a => new Date(a.date!).getFullYear())
    if (yearsWithArticles.length > 0) {
      const mostRecentYear = Math.max(...yearsWithArticles)
      currentYear.value = mostRecentYear
    }
  }
}, { immediate: true })

// Hovered date for tooltip
const hoveredDay = ref<{ date: Date; count: number } | null>(null)

// Selected date for filtering
const selectedDate = ref<string | null>(null)

// Get available years from articles
const availableYears = computed(() => {
  const years = new Set<number>()
  const thisYear = new Date().getFullYear()

  // Always include current year
  years.add(thisYear)

  // Add years from articles
  props.articles.forEach(article => {
    if (article.date) {
      years.add(new Date(article.date).getFullYear())
    }
  })

  return Array.from(years).sort((a, b) => b - a)
})

// Navigation
const canGoPrev = computed(() => {
  const minYear = Math.min(...availableYears.value)
  return currentYear.value > minYear
})

const canGoNext = computed(() => {
  return currentYear.value < new Date().getFullYear()
})

const goToPrevYear = () => {
  if (canGoPrev.value) {
    currentYear.value--
  }
}

const goToNextYear = () => {
  if (canGoNext.value) {
    currentYear.value++
  }
}

// Generate weeks for the selected year
const weeks = computed(() => {
  const year = currentYear.value
  const grid: Array<Array<{ date: Date; count: number }>> = []

  // Start from January 1st of selected year
  const startOfYear = new Date(year, 0, 1)
  // Adjust to start on Sunday
  const startDate = new Date(startOfYear)
  startDate.setDate(startDate.getDate() - startDate.getDay())

  // End of year
  const endOfYear = new Date(year, 11, 31)

  // Create article count map
  const articleCounts = new Map<string, number>()
  props.articles.forEach(article => {
    if (article.date) {
      const dateStr = new Date(article.date).toISOString().split('T')[0]
      if (dateStr) {
        articleCounts.set(dateStr, (articleCounts.get(dateStr) || 0) + 1)
      }
    }
  })

  // Generate weeks for the year
  let currentDate = new Date(startDate)
  while (currentDate <= endOfYear || grid.length < 53) {
    const weekDays: Array<{ date: Date; count: number }> = []

    for (let day = 0; day < 7; day++) {
      const cellDate = new Date(currentDate)
      cellDate.setDate(currentDate.getDate() + day)

      // Only hide dates outside the selected year
      const isOutsideYear = cellDate.getFullYear() !== year

      if (isOutsideYear) {
        weekDays.push({ date: cellDate, count: -1 }) // -1 means hidden
      } else {
        // Show all days of the year (including future dates)
        const dateStr = cellDate.toISOString().split('T')[0]
        if (dateStr) {
          const count = articleCounts.get(dateStr) || 0
          weekDays.push({ date: cellDate, count })
        }
      }
    }

    grid.push(weekDays)
    currentDate.setDate(currentDate.getDate() + 7)

    // Safety: don't go beyond 54 weeks
    if (grid.length >= 54) break
  }

  return grid
})

// Get month labels
const monthLabels = computed(() => {
  const labels: Array<{ month: string; col: number }> = []
  let lastMonth = -1
  const dateLocale = locale.value === 'ja' ? 'ja-JP' : 'en-US'

  weeks.value.forEach((week, weekIndex) => {
    const firstDayOfWeek = week[0]?.date
    if (!firstDayOfWeek) return

    const month = firstDayOfWeek.getMonth()
    const year = firstDayOfWeek.getFullYear()

    // Show all months for the selected year
    if (month !== lastMonth && year === currentYear.value) {
      labels.push({
        month: firstDayOfWeek.toLocaleDateString(dateLocale, { month: 'short' }),
        col: weekIndex
      })
      lastMonth = month
    }
  })

  return labels
})

// Get intensity class based on count
const getIntensityClass = (count: number) => {
  if (count === -1) return 'bg-transparent'
  if (count === 0) return 'bg-gray-100'
  if (count === 1) return 'bg-primary-200'
  if (count === 2) return 'bg-primary-300'
  if (count >= 3) return 'bg-primary'
  return 'bg-gray-100'
}

// Format date for tooltip display
const formatHoveredDate = computed(() => {
  if (!hoveredDay.value || hoveredDay.value.count === -1) return ''
  const date = hoveredDay.value.date

  if (locale.value === 'ja') {
    // Format: 2024年1月10日（水）
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekday = date.toLocaleDateString('ja-JP', { weekday: 'short' })
    return `${year}年${month}月${day}日（${weekday}）`
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
})

// Count articles for current year
const yearArticleCount = computed(() => {
  return props.articles.filter(article => {
    if (!article.date) return false
    return new Date(article.date).getFullYear() === currentYear.value
  }).length
})

// Handle mouse events
const onCellEnter = (day: { date: Date; count: number }) => {
  if (day.count !== -1) {
    hoveredDay.value = day
  }
}

const onCellLeave = () => {
  hoveredDay.value = null
}

// Handle cell click
const onCellClick = (day: { date: Date; count: number }) => {
  if (day.count > 0) {
    // Emit the date in YYYY-MM-DD format
    const dateStr = day.date.toISOString().split('T')[0]
    if (dateStr) {
      selectedDate.value = dateStr
      emit('date-selected', dateStr)
    }
  }
}

// Clear selection
const clearSelection = () => {
  selectedDate.value = null
  emit('date-selected', null)
}

// Check if a day is selected
const isSelected = (day: { date: Date; count: number }) => {
  if (!selectedDate.value || day.count === -1) return false
  const dateStr = day.date.toISOString().split('T')[0]
  return dateStr === selectedDate.value
}
</script>

<template>
  <div class="activity-grid">
    <!-- Year Title with Navigation -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-display font-semibold text-primary">
          {{ currentYear }}
        </h3>
        <span class="text-sm text-gray-500">
          {{ yearArticleCount }} {{ t('activityGrid.articles', yearArticleCount) }}
        </span>
      </div>
      <div class="flex items-center gap-1">
        <button
          @click="goToPrevYear"
          :disabled="!canGoPrev"
          class="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="heroicons:chevron-left" class="w-4 h-4 text-gray-600" />
        </button>
        <button
          @click="goToNextYear"
          :disabled="!canGoNext"
          class="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>

    <!-- Month labels -->
    <div class="relative h-4 mb-1">
      <div
        v-for="label in monthLabels"
        :key="label.col + label.month"
        class="absolute text-xs text-gray-500"
        :style="{ left: `${label.col * 13}px` }"
      >
        {{ label.month }}
      </div>
    </div>

    <!-- Grid (no day labels) -->
    <div class="flex gap-[3px]">
      <div
        v-for="(week, weekIndex) in weeks"
        :key="weekIndex"
        class="flex flex-col gap-[3px]"
      >
        <div
          v-for="(day, dayIndex) in week"
          :key="dayIndex"
          :class="[
            'w-[10px] h-[10px] rounded-sm transition-colors',
            isSelected(day) ? 'bg-primary ring-2 ring-primary-400 ring-offset-1' : getIntensityClass(day.count),
            day.count >= 0 ? 'hover:ring-2 hover:ring-primary-300' : '',
            day.count > 0 ? 'cursor-pointer' : ''
          ]"
          @mouseenter="onCellEnter(day)"
          @mouseleave="onCellLeave"
          @click="onCellClick(day)"
        />
      </div>
    </div>

    <!-- Footer: Hovered date + legend (always shown) -->
    <div class="flex items-center justify-between mt-3 h-5">
      <!-- Hovered date tooltip -->
      <div class="text-xs text-primary font-medium">
        <span v-if="formatHoveredDate">{{ formatHoveredDate }}</span>
      </div>

      <!-- Legend -->
      <div class="flex items-center gap-2 text-xs text-gray-500">
        <span>{{ t('activityGrid.less') }}</span>
        <div class="flex gap-[3px]">
          <div class="w-[10px] h-[10px] rounded-sm bg-gray-100" />
          <div class="w-[10px] h-[10px] rounded-sm bg-primary-200" />
          <div class="w-[10px] h-[10px] rounded-sm bg-primary-300" />
          <div class="w-[10px] h-[10px] rounded-sm bg-primary" />
        </div>
        <span>{{ t('activityGrid.more') }}</span>
      </div>
    </div>

    <!-- Clear button (shown when date selected) -->
    <div v-if="selectedDate" class="flex items-center justify-center mt-3">
      <Button
        variant="outline"
        size="sm"
        @click="clearSelection"
      >
        <Icon name="heroicons:x-circle" class="w-4 h-4 mr-1" />
        {{ t('articles.clearFilter') }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
.activity-grid {
  position: relative;
}
</style>
