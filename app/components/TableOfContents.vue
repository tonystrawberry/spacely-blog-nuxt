<script setup lang="ts">
export interface TocItem {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  items: TocItem[]
  title?: string
  emptyText?: string
}>()

const { t } = useI18n()

// Active heading tracking
const activeHeadingId = ref<string | null>(null)

// Use scroll-based tracking for better accuracy
onMounted(() => {
  if (props.items.length === 0) return

  // Set initial active heading
  updateActiveHeading()

  // Listen to scroll events with throttling
  let ticking = false
  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveHeading()
        ticking = false
      })
      ticking = true
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})

const updateActiveHeading = () => {
  if (props.items.length === 0) return

  const headingElements = props.items
    .map(item => document.getElementById(item.id))
    .filter((el): el is HTMLElement => el !== null)

  if (headingElements.length === 0) return

  const scrollTop = window.scrollY
  const headerOffset = 100 // Account for fixed header + some buffer

  // Find the heading that is currently at or just above the viewport top
  let currentHeading: string | null = null

  for (let i = headingElements.length - 1; i >= 0; i--) {
    const el = headingElements[i]

    if (!el) continue

    const rect = el.getBoundingClientRect()
    const absoluteTop = rect.top + scrollTop

    // If this heading is above or at the scroll position (accounting for header)
    if (absoluteTop <= scrollTop + headerOffset) {
      currentHeading = el.id
      break
    }
  }

  // If no heading is above viewport, use the first one if we're near the top
  if (!currentHeading && headingElements.length > 0) {
    const firstEl = headingElements[0]

    if (firstEl) {
      const rect = firstEl.getBoundingClientRect()
      if (rect.top < window.innerHeight) {
        currentHeading = firstEl.id
      }
    }
  }

  if (currentHeading) {
    activeHeadingId.value = currentHeading
  }
}

// Smooth scroll to anchor
const scrollToHeading = (id: string, event?: Event) => {
  const element = document.getElementById(id)
  if (element) {
    event?.preventDefault()
    const offset = 80 // Account for fixed header
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.scrollY - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })

    // Update URL hash without jumping
    history.pushState(null, '', `#${id}`)

    // Update active heading immediately for better UX
    activeHeadingId.value = id
  }
}

// Get padding class based on heading level
const getPaddingClass = (level: number) => {
  switch (level) {
    case 1: return 'pl-4'
    case 2: return 'pl-4'
    case 3: return 'pl-6'
    case 4: return 'pl-8'
    default: return 'pl-4'
  }
}
</script>

<template>
  <div class="bg-white rounded-xl p-6 shadow-sm border border-primary-100">
    <h2 class="text-lg font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <Icon name="heroicons:list-bullet" class="w-5 h-5 text-primary" />
      {{ title || t('article.toc') }}
    </h2>

    <nav v-if="items && items.length > 0" class="relative">
      <!-- Vertical line -->
      <div class="absolute left-[3px] top-2 bottom-2 w-px bg-primary-100"></div>

      <div class="space-y-0.5">
        <a
          v-for="heading in items"
          :key="heading.id"
          :href="`#${heading.id}`"
          @click="scrollToHeading(heading.id, $event)"
          class="group relative flex items-center text-sm py-2 transition-all duration-200 cursor-pointer"
          :class="[
            getPaddingClass(heading.level),
            activeHeadingId === heading.id
              ? 'text-primary font-medium'
              : 'text-gray-500 hover:text-gray-800'
          ]"
        >
          <!-- Marker dot - always visible -->
          <span
            class="absolute left-0 top-1/2 -translate-y-1/2 w-[7px] h-[7px] rounded-full border-2 transition-all duration-300"
            :class="[
              activeHeadingId === heading.id
                ? 'bg-primary border-primary shadow-sm shadow-primary/40 scale-110'
                : 'bg-white border-primary-200 group-hover:border-primary-400 group-hover:scale-110'
            ]"
          ></span>

          <span class="truncate font-medium">{{ heading.text }}</span>
        </a>
      </div>
    </nav>

    <p v-else class="text-sm text-gray-500 italic">
      {{ emptyText || t('article.noToc') }}
    </p>
  </div>
</template>
