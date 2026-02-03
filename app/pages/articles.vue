<script setup lang="ts">
import type { Author } from '../types/article'

useHead({
  title: 'Articles - Spacely Tech Blog'
})

const authors: Author[] = [
  { name: '@nazar-pc', avatar: 'https://i.pravatar.cc/100?img=11' },
  { name: '@ytocquet', avatar: 'https://i.pravatar.cc/100?img=12' },
  { name: '@LITUATUI', avatar: 'https://i.pravatar.cc/100?img=13' },
]

const route = useRoute()
const router = useRouter()

const page = computed(() => {
  const pageParam = route.query.page
  const pageNum = typeof pageParam === 'string' ? parseInt(pageParam, 10) : 1
  return isNaN(pageNum) || pageNum < 1 ? 1 : pageNum
})

const itemsPerPage = 9

// Query all articles from content
const { data: allArticles } = await useAsyncData('all-articles', async () => {
  try {
    // Query all content items - Nuxt Content v3 syntax
    const allContent = await queryCollection('content').all()

    if (!allContent || !Array.isArray(allContent)) {
      return []
    }

    // Filter out index, about pages and only get article markdown files
    const filtered = allContent
      .filter((item: any) => {
        const path = item.path || item._path || ''
        // Exclude index, about, and root path
        return path !== '/index' &&
               path !== '/' &&
               path !== '/about'
      })
      .sort((a: any, b: any) => {
        // Sort by date if available (newest first)
        const dateA = a.date || a.meta?.date ? new Date(a.date || a.meta?.date).getTime() : (a._createdAt ? new Date(a._createdAt).getTime() : 0)
        const dateB = b.date || b.meta?.date ? new Date(b.date || b.meta?.date).getTime() : (b._createdAt ? new Date(b._createdAt).getTime() : 0)
        return dateB - dateA
      })

    return filtered
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
})

const totalArticles = computed(() => allArticles.value?.length || 0)
const totalPages = computed(() => Math.ceil(totalArticles.value / itemsPerPage))
const articles = computed(() => {
  if (!allArticles.value) return []
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return allArticles.value.slice(start, end)
})

const handlePageChange = (newPage: number) => {
  // Update URL with new page number
  navigateTo({
    path: '/articles',
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
    <section class="py-16 bg-white border-b border-primary-100">
      <div class="max-w-7xl mx-auto px-6">
        <h1 class="text-4xl md:text-5xl font-display font-bold text-primary mb-4">
          All Articles
        </h1>
        <p class="text-xl text-gray-600">
          Explore all our articles and tutorials
        </p>
      </div>
    </section>

    <!-- Articles Grid -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-6">
        <!-- Results Summary -->
        <div v-if="totalArticles > 0" class="mb-8 text-gray-600">
          <p class="text-sm">
            Showing {{ (page - 1) * itemsPerPage + 1 }}-{{ Math.min(page * itemsPerPage, totalArticles) }} of {{ totalArticles }} articles
          </p>
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
          <p class="text-gray-500 text-lg">No articles found.</p>
        </div>
      </div>

      <!-- Pagination -->
      <div class="max-w-7xl mx-auto px-6 mt-8">
        <Pagination
          :current-page="page"
          :total-pages="totalPages"
          @update:page="handlePageChange"
        />
      </div>
    </section>
  </div>
</template>
