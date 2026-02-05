<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { authors } = useAuthors()

// SEO - @nuxtjs/seo handles OG, Twitter, canonical automatically
useSeoMeta({
  title: () => t('articles.pageTitle'),
  description: () => t('articles.description'),
  ogImage: '/logo.png',
})

const router = useRouter()

const page = computed(() => {
  const pageParam = route.query.page
  const pageNum = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1
  return isNaN(pageNum) || pageNum < 1 ? 1 : pageNum
})

const itemsPerPage = 9

// No filters on articles page - moved to search page

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
      // Only include items from the current locale's articles folder
      const isArticle = path.startsWith(`/${currentLocale}/articles/`)
      return isArticle
    })
    .sort((a: any, b: any) => {
      // Sort by date if available (newest first)
      const dateA = a.date || a.meta?.date ? new Date(a.date || a.meta?.date).getTime() : 0
      const dateB = b.date || b.meta?.date ? new Date(b.date || b.meta?.date).getTime() : 0
      return dateB - dateA
    })
})

// No filters - just use all articles
const filteredArticles = computed(() => allArticles.value)
const totalArticles = computed(() => filteredArticles.value?.length || 0)
// Adjust total pages calculation to account for featured article
const totalPages = computed(() => {
  const articlesCount = !latestArticle.value
    ? totalArticles.value
    : Math.max(0, totalArticles.value - 1) // Subtract 1 for featured article
  return Math.ceil(articlesCount / itemsPerPage)
})

// Get the latest article (featured article)
const latestArticle = computed(() => {
  if (!filteredArticles.value || filteredArticles.value.length === 0) return null
  return filteredArticles.value[0]
})

// Articles excluding the latest one (for the grid)
const articlesForGrid = computed(() => {
  if (!filteredArticles.value) return []
  // Exclude the latest article and paginate the rest
  const articlesWithoutLatest = latestArticle.value
    ? filteredArticles.value.slice(1)
    : filteredArticles.value
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return articlesWithoutLatest.slice(start, end)
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
        </div>

      </div>
    </section>

    <!-- Featured Article Section -->
    <section v-if="latestArticle" class="py-8 bg-[#fef2f5]">
      <div class="max-w-7xl mx-auto px-6">
        <FeaturedArticleCard
          :article="latestArticle as Record<string, any>"
          :authors="authors"
        />
      </div>
    </section>

    <!-- Articles Grid -->
    <section class="py-8">
      <div class="max-w-7xl mx-auto px-6">
        <!-- Results Summary -->
        <div class="mb-8">
          <h2 v-if="totalArticles > 0" class="text-2xl font-display font-bold text-primary">
            <template v-if="latestArticle">
              {{ t('articles.showing', {
                start: (page - 1) * itemsPerPage + 1,
                end: Math.min(page * itemsPerPage, totalArticles - 1),
                total: totalArticles - 1
              }) }}
            </template>
            <template v-else>
              {{ t('articles.showing', {
                start: (page - 1) * itemsPerPage + 1,
                end: Math.min(page * itemsPerPage, totalArticles),
                total: totalArticles
              }) }}
            </template>
          </h2>
        </div>

        <div v-if="articlesForGrid && Array.isArray(articlesForGrid) && articlesForGrid.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ArticleCard
            v-for="(article, index) in articlesForGrid"
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
      <div v-if="totalPages > 1" class="max-w-7xl mx-auto px-6 mt-8">
        <Pagination
          :current-page="page"
          :total-pages="totalPages"
          @update:page="handlePageChange"
        />
      </div>
    </section>
  </div>
</template>
