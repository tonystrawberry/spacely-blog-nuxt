<script setup lang="ts">
import type { Author } from '../types/article'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// SEO - @nuxtjs/seo handles OG, Twitter, canonical automatically
useSeoMeta({
  title: () => t('articles.pageTitle'),
  description: () => t('articles.description'),
  ogImage: '/logo.png',
})

const authors: Author[] = [
  { name: '@nazar-pc', avatar: 'https://i.pravatar.cc/100?img=11' },
  { name: '@ytocquet', avatar: 'https://i.pravatar.cc/100?img=12' },
  { name: '@LITUATUI', avatar: 'https://i.pravatar.cc/100?img=13' },
]

const router = useRouter()

const page = computed(() => {
  const pageParam = route.query.page
  const pageNum = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1
  return isNaN(pageNum) || pageNum < 1 ? 1 : pageNum
})

const itemsPerPage = 9

// Selected date filter
const selectedDate = ref<string | null>(null)

// Query ALL content (not filtered by locale - for SSR compatibility)
const { data: allContent, error } = await useAsyncData(
  'articles-content',
  async () => {
    try {
      const content = await queryCollection('content').all()
      return content || []
    } catch (e) {
      console.error('Error fetching content:', e)
      return []
    }
  },
  {
    default: () => [],
    server: false,
  }
)

// Filter articles by current locale (reactive computed)
const allArticles = computed(() => {
  if (!allContent.value || !Array.isArray(allContent.value)) return []

  const currentLocale = locale.value || 'ja'

  return allContent.value
    .filter((item: any) => {
      const path = item.path || item._path || ''
      // Only include items from the current locale folder
      const isCurrentLocale = path.startsWith(`/${currentLocale}/`)
      // Exclude index, about pages
      const isNotSpecialPage = !path.endsWith('/index') &&
                                !path.endsWith('/about')
      return isCurrentLocale && isNotSpecialPage
    })
    .sort((a: any, b: any) => {
      // Sort by date if available (newest first)
      const dateA = a.date || a.meta?.date ? new Date(a.date || a.meta?.date).getTime() : 0
      const dateB = b.date || b.meta?.date ? new Date(b.date || b.meta?.date).getTime() : 0
      return dateB - dateA
    })
})

// Filter articles by selected date
const filteredArticles = computed(() => {
  if (!allArticles.value) return []

  if (selectedDate.value) {
    return allArticles.value.filter((article: any) => {
      if (!article.date) return false
      const articleDate = new Date(article.date).toISOString().split('T')[0]
      return articleDate === selectedDate.value
    })
  }

  return allArticles.value
})

const totalArticles = computed(() => filteredArticles.value?.length || 0)
const totalPages = computed(() => Math.ceil(totalArticles.value / itemsPerPage))
const articles = computed(() => {
  if (!filteredArticles.value) return []
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredArticles.value.slice(start, end)
})

// Handle date selection from activity grid
const handleDateSelected = (date: string | null) => {
  selectedDate.value = date
  // Reset to first page when filtering
  if (date) {
    navigateTo({
      path: localePath('/articles'),
      query: { page: '1' }
    })
  }
}


// Format selected date for display
const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) return null
  const date = new Date(selectedDate.value)

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
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
})

const handlePageChange = (newPage: number) => {
  // Update URL with new page number
  navigateTo({
    path: localePath('/articles'),
    query: { page: newPage.toString() }
  })
  // Scroll to top when page changes
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
</script>

<template>
  <div class="min-h-screen bg-[#fef2f5]">
    <AppHeader />

    <!-- Articles Page Header -->
    <section class="py-12 bg-white border-b border-primary-100">
      <div class="max-w-7xl mx-auto px-6">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-display font-bold text-primary mb-2 text-center">
            {{ t('articles.title') }}
          </h1>
          <p class="text-lg text-gray-600 mb-8 text-center">
            {{ t('articles.description') }}
          </p>

          <!-- Activity Grid (hidden on mobile) -->
          <div class="hidden md:flex justify-center">
            <ActivityGrid
              :articles="allArticles || []"
              @date-selected="handleDateSelected"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Articles Grid -->
    <section class="py-8">
      <div class="max-w-7xl mx-auto px-6">
        <!-- Results Summary -->
        <div v-if="totalArticles > 0" class="mb-8">
          <h2 class="text-2xl font-display font-bold text-primary">
            <template v-if="selectedDate">
              {{ formattedSelectedDate }}
            </template>
            <template v-else>
              {{ t('articles.showing', { start: (page - 1) * itemsPerPage + 1, end: Math.min(page * itemsPerPage, totalArticles), total: totalArticles }) }}
            </template>
          </h2>
        </div>

        <div v-if="articles && Array.isArray(articles) && articles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ArticleCard
            v-for="(article, index) in articles"
            :key="(article as Record<string, any>)?._path || (article as Record<string, any>)?.path || index"
            :article="article as Record<string, any>"
            :authors="authors"
          />
        </div>
        <div v-else class="text-center py-16">
          <Icon name="heroicons:document-text" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-500 text-lg">{{ t('articles.noArticles') }}</p>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="!selectedDate" class="max-w-7xl mx-auto px-6 mt-8">
        <Pagination
          :current-page="page"
          :total-pages="totalPages"
          @update:page="handlePageChange"
        />
      </div>
    </section>
  </div>
</template>
